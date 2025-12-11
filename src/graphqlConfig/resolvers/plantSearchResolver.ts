import { polygon } from "@turf/turf";
import { Position } from "geojson";
import {
  AggregationCursor,
  Filter,
  FindCursor,
  Sort,
  SortDirection,
} from "mongodb";
import { plantCollection } from "../../config/mongodbClient";
import { PlantDataDocument } from "../../config/types";
import {
  InputMaybe,
  PlantData,
  PlantDataInput,
  QueryResolvers,
  SortInput,
} from "../graphql";

export const plantSearchResolver: QueryResolvers["plantSearch"] = async (
  _,
  { sort, limit, offset, where }
) => {
  const { cursor, filter } = createFilteredCursor(where);
  const sortObject = getSortObject(sort);

  // TODO: Return distinct options per geographic area for fields like bloom color, bloom time
  // plantData.distinct("bloomColors", {
  //   "occurrences.occurrenceCoords": {
  //     $geoWithin: { $geometry: boundingPolyCoords },
  //   },
  // });

  sortObject && cursor.sort(sortObject);
  offset && cursor.skip(offset);
  limit && cursor.limit(limit);

  const [count, results] = await Promise.all([
    plantCollection.countDocuments(filter),
    cursor.toArray(),
  ]);

  return { count, results };
};

const getSortObject = (sort?: InputMaybe<SortInput[]>): Sort | undefined =>
  sort?.reduce<Record<string, SortDirection>>((prev, { field, direction }) => {
    prev[field] = direction as SortDirection;
    return prev;
  }, {});

export const createFilteredCursor = (where?: InputMaybe<PlantDataInput>) => {
  let cursor: FindCursor<PlantData> | AggregationCursor<PlantData>;
  const filter = where ? extractPlantFilter(where) : {};

  if (!where?.boundingPolyCoords) {
    cursor = plantCollection.find(filter);
  } else {
    const occurrenceFilter = constructBboxFilter(where.boundingPolyCoords);

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
    {}
  );

export const parseBboxInput = (bbox: Position[][]) => {
  try {
    return polygon(bbox);
  } catch (error) {
    console.error(
      "Error converting input to polygon:",
      bbox,
      "\nError:",
      error
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
