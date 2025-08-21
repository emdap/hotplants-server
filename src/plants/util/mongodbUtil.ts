import { Feature, Polygon } from "geojson";
import { WithId } from "mongodb";
import {
  GbifOccurrenceSearchParams,
  GbifOccurrenceSearchResponse,
} from "../../config/gbifClient";
import {
  gbifSearchesCollection,
  plantCollection,
} from "../../config/mongodbClient";
import { GbifSearchRecord, PlantDataRaw } from "../../config/types";
import { scrapePFAF } from "../pfafScraper";

export const lookupPlantByName = async (
  scientificName: string
): Promise<PlantDataRaw> => {
  const lowercaseName = scientificName.toLowerCase();
  const existingPlant = await plantCollection.findOne({
    scientificName: lowercaseName,
  });

  return existingPlant ?? scrapePFAF(lowercaseName);
};

export const storePlantData = async (plantData: PlantDataRaw) => {
  const { _id, ...rest } = plantData;

  return _id
    ? plantCollection.updateOne({ _id }, { $set: rest })
    : plantCollection.insertOne(rest);
};

export const lookupPlantByCoordinates = async ({
  geometry,
}: Feature<Polygon>) =>
  plantCollection
    .find({
      occurrenceCoords: { $geoIntersects: { $geometry: geometry } },
    })
    .toArray();

export const getGbifSearchRecord = (
  gbifSearchParams: GbifOccurrenceSearchParams
) => {
  const jsonStringSearch = JSON.stringify(gbifSearchParams);

  return gbifSearchesCollection.findOneAndUpdate(
    {
      jsonStringSearch,
    },
    {
      $setOnInsert: {
        jsonStringSearch,
        pageSize: gbifSearchParams.limit,
        lastPageSearched: 0,
        hasNextPage: false,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
};

export const updateGbifSearchRecord = (
  searchRecord: WithId<GbifSearchRecord>,
  { offset, limit, endOfRecords }: GbifOccurrenceSearchResponse
) =>
  gbifSearchesCollection.updateOne(
    { _id: searchRecord._id },
    {
      $set: {
        hasNextPage: !endOfRecords,
        lastPageSearched: limit && Math.round((offset ?? 0) / limit),
      },
    }
  );
