import { polygon } from "@turf/turf";
import { Position } from "geojson";
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
  return (
    inputPolygon && {
      "occurrences.occurrenceCoords": {
        $geoWithin: { $geometry: inputPolygon.geometry },
      },
    }
  );
};
