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
import {
  OccurrenceScrapeResponse,
  PlantDataDocument,
} from "../../config/types";
import { SearchRecord, SearchRecordStatus } from "../../graphql/graphql";
import { scrapePFAF } from "../pfafScraper";

export type GbifPaginationInfo = Pick<
  GbifOccurrenceSearchResponse,
  "offset" | "limit" | "endOfRecords"
>;

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

export const openGbifSearchRecord = (
  gbifSearchParams: GbifOccurrenceSearchParams
) => {
  const jsonStringSearch = JSON.stringify(gbifSearchParams);

  return gbifSearchesCollection.findOneAndUpdate(
    {
      jsonStringSearch,
    },
    { $set: { status: SearchRecordStatus.Scraping } }
  );
};

export const createGbifSearchRecord = async (
  gbifSearchParams: GbifOccurrenceSearchParams
) => {
  const jsonStringSearch = JSON.stringify(gbifSearchParams);

  const insertedRecord = await gbifSearchesCollection.insertOne({
    jsonStringSearch,
    status: SearchRecordStatus.Scraping,
    pageSize: gbifSearchParams.limit,
    lastPageSearched: 0,
    uniqueOccurrences: 0,
    hasNextPage: false,
  });

  return (
    insertedRecord.insertedId &&
    gbifSearchesCollection.findOne(insertedRecord.insertedId)
  );
};

export const closeGbifSearchRecord = (
  searchRecord: WithId<SearchRecord>,
  { paginationInfo, count }: OccurrenceScrapeResponse
) =>
  gbifSearchesCollection.updateOne(
    { _id: searchRecord._id },
    {
      $set: {
        status: SearchRecordStatus.Done,
        hasNextPage: !paginationInfo.endOfRecords && count !== 0,
        lastPageSearched:
          paginationInfo.limit &&
          Math.round((paginationInfo.offset ?? 0) / paginationInfo.limit),
        uniqueOccurrences: (searchRecord.uniqueOccurrences || 0) + count,
      },
    }
  );
