import { bboxPolygon } from "@turf/turf";
import { createHash } from "crypto";
import { BBox } from "geojson";
import { Filter, ObjectId, Sort } from "mongodb";
import {
  gbifSearchesCollection,
  plantCollection,
} from "../config/mongodbClient";
import { PlantDataDocument } from "../config/types";
import { MutationResolvers, PlantDataInput, QueryResolvers } from "./graphql";

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

export const parseBboxInput = (bbox: number[]) => {
  try {
    return bbox?.length === 4 ? bboxPolygon(bbox as BBox) : undefined;
  } catch (error) {
    console.error("Error converting input to BBox:", error);
  }
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

export const replaceWithProxyUrlResolver: MutationResolvers["replaceWithProxyUrl"] =
  async (_, { plantId, replaceUrl }) => {
    const plantData = await plantCollection.findOne(
      new ObjectId(plantId as string)
    );

    if (plantData) {
      const mediaIndex = plantData.mediaUrls.findIndex(
        ({ url }) => url === replaceUrl
      );
      if (mediaIndex !== -1) {
        const { url, occurrenceId } = plantData.mediaUrls[mediaIndex];
        const md5Url = createHash("md5").update(url).digest("hex");
        const proxyUrl = `https://api.gbif.org/v1/image/cache/occurrence/${occurrenceId}/media/${md5Url}`;

        const { modifiedCount } = await plantCollection.updateOne(
          { _id: new ObjectId(plantId as string) },
          {
            $set: {
              [`mediaUrls.${mediaIndex}.url`]: proxyUrl,
              [`mediaUrls.${mediaIndex}.isProxyUrl`]: true,
            },
          }
        );

        return modifiedCount ? proxyUrl : null;
      }
    }

    return null;
  };

export const searchRecordResolver: QueryResolvers["searchRecord"] = (
  _,
  { id }
) => gbifSearchesCollection.findOne(new ObjectId(id));
