import { polygon } from "@turf/turf";
import { Polygon, Position } from "geojson";
import { GraphQLError } from "graphql";
import { AggregationCursor, Filter, FindCursor, ObjectId } from "mongodb";
import { plantsCollection } from "../../config/mongodbClient";
import { PlantDataDocument } from "../../config/types";
import {
  InputMaybe,
  PlantData,
  PlantDataInput,
  QueryResolvers,
} from "../graphql";
import { applySortSkipLimit, countAndResults } from "./resolverUtils";

export const plantResolver: QueryResolvers["plant"] = async (
  _,
  { id, boundingPolyCoords },
) => {
  if (!boundingPolyCoords) {
    return plantsCollection.findOne(new ObjectId(id));
  }

  const { cursor } = createFilteredCursor({ _id: id, boundingPolyCoords });
  const array = await cursor.toArray();
  return array[0];
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
  const { cursor, filter } = createFilteredCursor(where);
  applySortSkipLimit(cursor, args);
  return countAndResults(plantsCollection, cursor, filter);
};

export const createFilteredCursor = (where?: InputMaybe<PlantDataInput>) => {
  let cursor: FindCursor<PlantData> | AggregationCursor<PlantData>;
  const filter = where ? extractPlantFilter(where) : {};

  if (!where?.boundingPolyCoords) {
    cursor = plantsCollection.find(filter);
  } else {
    const occurrenceFilter = constructBboxFilter(where.boundingPolyCoords);
    cursor = plantsCollection.aggregate([
      { $match: filter },

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
    ]);
  }

  return { cursor, filter };
};

export const extractPlantFilter = (filter: PlantDataInput) =>
  Object.entries(filter).reduce<Filter<PlantDataDocument>>(
    (prev, [property, value]) => {
      const valueIsArray = Array.isArray(value);
      if (
        !value ||
        ((typeof value === "string" || valueIsArray) && !value.length)
      ) {
        return prev;
      }

      if (typeof value === "string") {
        const regex = new RegExp(value.trim(), "i");
        prev[property === "commonName" ? "commonNames" : property] = {
          $regex: regex,
        };
      } else if (property === "boundingPolyCoords") {
        prev = { ...prev, ...constructBboxFilter(value as Position[][]) };
      } else if (valueIsArray) {
        prev[property] = { $all: value };
      } else {
        prev[property] = value;
      }

      return prev;
    },
    {},
  );

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
