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
import { GbifSearchRecord, PlantDataDocument } from "../../config/types";
import { scrapePFAF } from "../pfafScraper";

/**
 *
 * Helper function to either return existing plant data from mongodb, or scrape the data from PFAF.
 * Indicate whether the data already existed, or was newly scraped.
 *
 * @param scientificName The plant name to search for. Search mongodb, scrape PFAF if not entry found
 * @returns Data for the plant. Property `existing` is true if the plant was already in mongodb.
 */
export const lookupPlantByName = async (
  scientificName: string
): Promise<{
  existing: boolean;
  data: PlantDataDocument;
}> => {
  const lowercaseName = scientificName.toLowerCase();
  const existingPlant = await plantCollection.findOne({
    scientificName: lowercaseName,
  });

  return {
    existing: !!existingPlant,
    data: existingPlant ?? (await scrapePFAF(lowercaseName)),
  };
};

export const storePlantData = async (plantData: PlantDataDocument) => {
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

  return gbifSearchesCollection.findOne({
    jsonStringSearch,
  });
};

export const updateGbifSearchRecord = async (
  existingRecord: WithId<GbifSearchRecord> | null,
  gbifSearchParams: GbifOccurrenceSearchParams,
  { offset, limit, endOfRecords }: GbifOccurrenceSearchResponse,
  newUniqueOccurrences: number = 0
) => {
  const createGbifSearchRecord = (
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

  const searchRecord =
    existingRecord ?? (await createGbifSearchRecord(gbifSearchParams));
  searchRecord &&
    gbifSearchesCollection.updateOne(
      { _id: searchRecord._id },
      {
        $set: {
          hasNextPage: !endOfRecords && newUniqueOccurrences !== 0,
          lastPageSearched: limit && Math.round((offset ?? 0) / limit),
          uniqueOccurrences:
            (searchRecord.uniqueOccurrences || 0) + newUniqueOccurrences,
        },
      }
    );
};
