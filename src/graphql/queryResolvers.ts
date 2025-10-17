import { bboxPolygon } from "@turf/turf";
import { BBox } from "geojson";
import { Filter, ObjectId, Sort } from "mongodb";
import {
  gbifSearchesCollection,
  plantCollection,
} from "../config/mongodbClient";
import { PlantDataDocument } from "../config/types";
import { PlantDataInput, QueryResolvers } from "./graphql";

export const parseBboxInput = (bbox: number[]) => {
  try {
    return bbox?.length === 4 ? bboxPolygon(bbox as BBox) : undefined;
  } catch (error) {
    console.error("Error converting input to BBox:", error);
  }
};

export const plantsResolver: QueryResolvers["plantSearch"] = async (
  _,
  { sort, limit, offset, where }
) => {
  const plantFilter = where ? extractPlantFilter(where) : {};

  const cursor = plantCollection.find(plantFilter);
  sort &&
    cursor.sort({ ...sort, scientificName: sort.scientificName || -1 } as Sort);
  offset && cursor.skip(offset);
  limit && cursor.limit(limit);

  const [count, results] = await Promise.all([
    plantCollection.countDocuments(plantFilter),
    cursor.toArray(),
  ]);

  return { count, results };
};

const extractPlantFilter = (filter: PlantDataInput) =>
  Object.entries(filter).reduce<Filter<PlantDataDocument>>(
    (prev, [property, value]) => {
      const valueIsArray = Array.isArray(value);
      if (property === "commonName" && typeof value === "string") {
        const regex = new RegExp(value, "i");
        prev.commonNames = { $regex: regex };
      } else if (property === "boundingBox" && valueIsArray) {
        const inputPolygon = parseBboxInput(value as number[]);
        prev.occurrenceCoords = inputPolygon && {
          $geoIntersects: { $geometry: inputPolygon.geometry },
        };
      } else if (valueIsArray) {
        prev[property] = { $all: value };
      } else if (typeof value === "string") {
        const regex = new RegExp(value, "i");
        prev[property] = { $regex: regex };
      } else {
        prev[property] = value;
      }

      return prev;
    },
    {}
  );

export const searchRecordResolver: QueryResolvers["searchRecord"] = (
  _,
  { id }
) => gbifSearchesCollection.findOne(new ObjectId(id));
