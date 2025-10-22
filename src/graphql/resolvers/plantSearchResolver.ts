import { bboxPolygon } from "@turf/turf";
import { BBox } from "geojson";
import { AggregationCursor, Filter, FindCursor, Sort } from "mongodb";
import { plantCollection } from "../../config/mongodbClient";
import { PlantDataDocument } from "../../config/types";
import { InputMaybe, PlantDataInput, QueryResolvers } from "../graphql";

export const plantSearchResolver: QueryResolvers["plantSearch"] = async (
  _,
  { sort, limit, offset, where }
) => {
  const { cursor, filter } = createFilteredCursor(where);

  sort &&
    cursor.sort({ ...sort, scientificName: sort.scientificName || -1 } as Sort);
  offset && cursor.skip(offset);
  limit && cursor.limit(limit);

  const [count, results] = await Promise.all([
    plantCollection.countDocuments(filter),
    cursor.toArray(),
  ]);

  return { count, results };
};

const createFilteredCursor = (where?: InputMaybe<PlantDataInput>) => {
  let cursor: FindCursor | AggregationCursor;
  const filter = where ? extractPlantFilter(where) : {};

  if (!where?.boundingBox) {
    cursor = plantCollection.find(filter);
  } else {
    const occurrenceFilter = constructBboxFilter(where.boundingBox);

    cursor = plantCollection.aggregate([
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

const extractPlantFilter = (filter: PlantDataInput) =>
  Object.entries(filter).reduce<Filter<PlantDataDocument>>(
    (prev, [property, value]) => {
      const valueIsArray = Array.isArray(value);
      if (typeof value === "string") {
        const regex = new RegExp(value.trim(), "i");
        prev[property === "commonName" ? "commonNames" : property] = {
          $regex: regex,
        };
      } else if (property === "boundingBox" && valueIsArray) {
        prev = { ...prev, ...constructBboxFilter(value as number[]) };
      } else if (valueIsArray) {
        prev[property] = { $all: value };
      } else {
        prev[property] = value;
      }

      return prev;
    },
    {}
  );

export const parseBboxInput = (bbox: number[]) => {
  try {
    return bbox?.length === 4 ? bboxPolygon(bbox as BBox) : undefined;
  } catch (error) {
    console.error("Error converting input to BBox:", error);
  }
};

const constructBboxFilter = (value: number[]) => {
  const inputPolygon = parseBboxInput(value as number[]);
  return (
    inputPolygon && {
      "occurrences.occurrenceCoords": {
        $geoWithin: { $geometry: inputPolygon.geometry },
      },
    }
  );
};
