import { Feature, Polygon } from "geojson";
import { ObjectId, WithId } from "mongodb";
import { GbifOccurrenceSearchParams } from "../../config/gbifClient";
import {
  gbifSearchesCollection,
  plantCollection,
} from "../../config/mongodbClient";
import {
  OccurrenceScrapeResponse,
  PartialPlantData,
  PlantDataDocument,
} from "../../config/types";
import {
  PlantDataInput,
  SearchRecord,
  SearchRecordStatus,
} from "../../graphql/graphql";
import { scrapePFAF } from "../pfafScraper";

export type PlantSearchParams = Omit<
  GbifOccurrenceSearchParams,
  "geometry" | "scientificName"
> &
  // TODO: Strange error, if given PlantDataInput as-is, TSOA has error
  // "GenerateMetadataError: Cannot read properties of undefined (reading 'kind')""
  Omit<PlantDataInput, "">;

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
  data: PartialPlantData;
}> => {
  const lowercaseName = scientificName.toLowerCase();
  const existingPlant = await plantCollection.findOne({
    scientificName: lowercaseName,
  });

  if (existingPlant) {
    return { existing: true, data: existingPlant };
  }
  const scrapedPlant = await scrapePFAF(lowercaseName);
  return {
    existing: false,
    data: {
      ...scrapedPlant,
      occurrenceCoords: [],
      occurrenceIds: [],
      mediaUrls: [],
    },
  };
};

export const storePlantData = async ({
  _id,
  ...plantData
}: PartialPlantData & { _id?: ObjectId; addedTimestamp?: number }) => {
  // Enforce strict typechecking
  const unixTimestamp = Date.now();
  const fullData: PlantDataDocument = {
    ...plantData,
    addedTimestamp: plantData.addedTimestamp ?? unixTimestamp,
    updatedTimestamp: unixTimestamp,
  };

  return _id
    ? plantCollection.updateOne({ _id }, { $set: fullData })
    : plantCollection.insertOne(fullData);
};

export const lookupPlantByCoordinates = async ({
  geometry,
}: Feature<Polygon>) =>
  plantCollection
    .find({
      occurrenceCoords: { $geoIntersects: { $geometry: geometry } },
    })
    .toArray();

const stringifySearch = (searchParams: PlantSearchParams | null) =>
  JSON.stringify(searchParams ?? undefined);

export const openGbifSearchRecord = (
  searchParams: PlantSearchParams | null
) => {
  const jsonStringSearch = stringifySearch(searchParams);

  return gbifSearchesCollection.findOneAndUpdate(
    {
      jsonStringSearch,
    },
    { $set: { status: SearchRecordStatus.Scraping, lastAddedCount: undefined } }
  );
};

export const createGbifSearchRecord = async (
  searchParams: PlantSearchParams | null,
  initialStatus: SearchRecordStatus = SearchRecordStatus.Scraping
) => {
  const jsonStringSearch = stringifySearch(searchParams);

  const insertedRecord = await gbifSearchesCollection.insertOne({
    jsonStringSearch,
    status: initialStatus,

    totalOccurrences: 0,
    uniqueOccurrences: 0,
  });

  return (
    insertedRecord.insertedId &&
    gbifSearchesCollection.findOne(new ObjectId(insertedRecord.insertedId))
  );
};

export const closeGbifSearchRecord = (
  searchRecord: WithId<SearchRecord>,
  { count, totalOccurrencesScraped, endOfRecords }: OccurrenceScrapeResponse
) => {
  // Enforce strict typechecking on the updated record
  const updatedSearchRecord: Omit<SearchRecord, "jsonStringSearch"> = {
    status: SearchRecordStatus.Done,
    lastAddedCount: count,
    uniqueOccurrences: searchRecord.uniqueOccurrences + count,
    totalOccurrences: searchRecord.totalOccurrences + totalOccurrencesScraped,
    endOfRecords,
  };

  return gbifSearchesCollection.updateOne(
    { _id: searchRecord._id },
    {
      $set: updatedSearchRecord,
    }
  );
};
