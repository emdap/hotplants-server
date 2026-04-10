import { STANDARD_UNIT } from "@/plants/pfafScraper";
import { polygon } from "@turf/turf";
import convert, { Unit } from "convert";
import { Polygon, Position } from "geojson";
import { GraphQLError } from "graphql";
import { Document, Filter, ObjectId } from "mongodb";
import { Entries } from "type-fest";
import { plantsCollection } from "../../config/mongodbClient";
import { PlantDataDocument } from "../../config/types";
import {
  PlantDataInput,
  PlantSizeRangeInput,
  QueryResolvers,
} from "../graphql";
import {
  aggregateAndProject,
  caseInsensitiveStringRegex,
  paginateWithCount,
} from "./resolverUtils";

export const plantResolver: QueryResolvers["plant"] = async (
  _,
  { id, boundingPolyCoords },
) => {
  const filter = boundingPolyCoords
    ? extractPlantFilter({ _id: id, boundingPolyCoords })
    : new ObjectId(id);
  return plantsCollection.findOne(filter);
};

export const plantOccurrencesResolver: QueryResolvers["plantOccurrences"] =
  async (_, { id, offset, limit }) => {
    const plant = await plantsCollection.findOne(new ObjectId(id));
    const useOffset = offset ?? 0;

    return (
      plant && {
        count: plant.occurrences.length,
        results: plant.occurrences.slice(
          useOffset,
          limit ? limit + useOffset : undefined,
        ),
      }
    );
  };

export const plantSearchResolver: QueryResolvers["plantSearch"] = async (
  _,
  { where, ...args },
) => {
  const aggregation: Document = where
    ? [{ $match: extractPlantFilter(where) }]
    : [];
  const paginate = paginateWithCount(args);

  if (!where?.boundingPolyCoords) {
    aggregation.push(paginate);
  } else {
    const occurrenceFilter = constructBboxFilter(where.boundingPolyCoords);
    aggregation.push(
      ...[
        {
          $addFields: {
            fullOccurrencesCount: { $size: "$occurrences" },
          },
        },

        { $unwind: "$occurrences" },
        { $match: occurrenceFilter },

        {
          $group: {
            _id: "$_id",
            plant: { $first: "$$ROOT" },

            occurrences: { $push: "$occurrences" },
            fullOccurrencesCount: { $first: "$fullOccurrencesCount" },
          },
        },

        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                "$plant",
                {
                  occurrences: "$occurrences",
                  fullOccurrencesCount: "$fullOccurrencesCount",
                },
              ],
            },
          },
        },

        paginate,
      ],
    );
  }

  return aggregateAndProject(plantsCollection, aggregation);
};

export const extractPlantFilter = (filter: PlantDataInput & { _id?: string }) =>
  (Object.entries(filter) as Entries<typeof filter>).reduce<
    Filter<PlantDataDocument>
  >((prev, [property, filter]) => {
    const simpleArrayFilter = Array.isArray(filter) ? filter : null;
    const complexArrayFilter =
      filter && typeof filter === "object" && "value" in filter ? filter : null;
    const rangeFilter =
      ["height", "spread"].includes(property) && typeof filter === "object"
        ? (filter as PlantSizeRangeInput)
        : null;

    if (
      (typeof filter === "string" && !filter.length) ||
      (simpleArrayFilter && !simpleArrayFilter.length) ||
      (complexArrayFilter && !complexArrayFilter.value?.length)
    ) {
      return prev;
    }

    const field = property === "commonName" ? "commonNames" : property;

    if (typeof filter === "string") {
      prev[field] = caseInsensitiveStringRegex(filter);
    } else if (field === "boundingPolyCoords") {
      prev = { ...prev, ...constructBboxFilter(filter as Position[][]) };
    } else if (field === "hasScrapedData" && typeof filter === "boolean") {
      prev.scrapeSources = filter ? { $ne: [] } : [];
    } else if (simpleArrayFilter) {
      prev[field] = { $in: simpleArrayFilter } as Filter<PlantDataDocument>;
    } else if (complexArrayFilter?.value) {
      prev[field] = complexArrayFilter.matchAll
        ? { $all: complexArrayFilter.value }
        : ({ $in: complexArrayFilter.value } as Filter<PlantDataDocument>);
    } else if (rangeFilter) {
      const { convertedMin, convertedMax, unit } =
        constructRangeFilter(rangeFilter);

      prev[`${field}.amount`] = {
        ...(convertedMin && { $gte: convertedMin }),
        ...(convertedMax && { $lte: convertedMax }),
      };
      prev[`${field}.unit`] = unit;
    }

    return prev;
  }, {});

export const parseBboxInput = (bbox: Position[][]) => {
  try {
    return polygon(bbox);
  } catch (error) {
    console.error(
      "Error converting input to polygon:",
      bbox,
      "\nError:",
      error,
    );

    throw error;
  }
};

const constructRangeFilter = (rangeFilter: PlantSizeRangeInput) => {
  const [minAmount, maxAmount] = (["minAmount", "maxAmount"] as const).map(
    (key) =>
      rangeFilter[key] !== null && rangeFilter[key] !== undefined
        ? convert(rangeFilter[key], rangeFilter.unit as Unit).to(STANDARD_UNIT)
        : undefined,
  );

  return {
    convertedMin: minAmount,
    convertedMax: maxAmount,
    unit: STANDARD_UNIT,
  };
};

const constructBboxFilter = (value: Position[][]) => {
  const inputPolygon = parseBboxInput(value);
  if (!inputPolygon) {
    throw new GraphQLError("Unable to parse input", {
      extensions: { code: 400 },
    });
  }

  const allPolygons = splitPolygonByLongitude(
    inputPolygon.geometry.coordinates,
  );

  return {
    $or: allPolygons.map((poly) => ({
      "occurrences.occurrenceCoords": {
        $geoWithin: { $geometry: poly },
      },
    })),
  };
};

// TODO: AI slop
/**
 * Splits a polygon into multiple polygons if it spans more than 180 degrees longitude.
 * Returns an array of polygons, each with max 180 degree longitude span.
 */
const MAX_SPAN = 90;

function splitPolygonByLongitude(coordinates: number[][][]): Polygon[] {
  const coords = coordinates[0];
  const lons = coords.map((coord) => coord[0]);
  const lats = coords.map((coord) => coord[1]);

  const west = Math.min(...lons);
  const east = Math.max(...lons);
  const south = Math.min(...lats);
  const north = Math.max(...lats);

  const lonSpan = east - west;

  // If small enough, return as-is
  if (lonSpan <= MAX_SPAN) {
    return [
      {
        type: "Polygon",
        coordinates: coordinates,
      },
    ];
  }

  // Split into multiple polygons
  const numSplits = Math.ceil(lonSpan / MAX_SPAN);
  const splitSize = lonSpan / numSplits;
  const polygons: Polygon[] = [];

  for (let i = 0; i < numSplits; i++) {
    const splitWest = west + i * splitSize;
    const splitEast = Math.min(west + (i + 1) * splitSize, east);

    polygons.push({
      type: "Polygon",
      coordinates: [
        [
          [splitWest, south],
          [splitEast, south],
          [splitEast, north],
          [splitWest, north],
          [splitWest, south],
        ],
      ],
    });
  }

  return polygons;
}
