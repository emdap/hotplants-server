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

export const plantsResolver: QueryResolvers["plants"] = (
  _,
  { sort, limit, offset, where }
) => {
  const plantFilter = where ? extractPlantFilter(where) : {};

  const cursor = plantCollection.find(plantFilter);
  sort && cursor.sort(sort as Sort);
  limit && cursor.limit(limit);
  offset && cursor.skip(offset);

  return cursor.toArray();
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
      } else {
        prev[property] = value;
      }

      return prev;
    },
    {}
  );

export const searchRecordsResolver: QueryResolvers["searchRecords"] = (
  _,
  { id }
) => gbifSearchesCollection.findOne(new ObjectId(id));
