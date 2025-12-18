import { Feature, Polygon } from "geojson";
import { ObjectId, OptionalId } from "mongodb";
import {
  gbifSearchesCollection,
  plantsCollection,
} from "../../config/mongodbClient";
import {
  OccurrenceScrapeResponse,
  PartialPlantData,
  PlantDataDocument,
  PlantSearchParams,
  SearchRecordDocument,
} from "../../config/types";
import { convertPolygon } from "./scrapingUtil";

/**
 *
 * Helper function to return existing plant data from mongodb.
 *
 * @param scientificName The plant name to search for
 * @returns Data for the plant
 */
export const getPlantByName = (scientificName: string) => {
  const lowercaseName = scientificName.toLowerCase();
  return plantsCollection.findOne({
    scientificName: lowercaseName,
  });
};

export const storePlantData = async ({
  _id,
  ...plantData
}: PartialPlantData & { _id?: ObjectId; addedTimestamp?: number }) => {
  const unixTimestamp = Date.now();
  // Enforce strict typechecking
  const fullData: Omit<PlantDataDocument, "_id"> = {
    ...plantData,
    addedTimestamp: plantData.addedTimestamp ?? unixTimestamp,
    updatedTimestamp: unixTimestamp,
  };

  return _id
    ? plantsCollection.updateOne({ _id }, { $set: fullData })
    : plantsCollection.insertOne(fullData);
};

export const lookupPlantByCoordinates = async ({
  geometry,
}: Feature<Polygon>) =>
  plantsCollection
    .find({
      occurrenceCoords: { $geoIntersects: { $geometry: geometry } },
    })
    .toArray();

const stringifySearch = (searchParams: PlantSearchParams | null) =>
  JSON.stringify(searchParams ?? undefined);

export const findGbifSearchRecord = (
  searchParams: PlantSearchParams | null
) => {
  const jsonStringSearch = stringifySearch(searchParams);
  return gbifSearchesCollection.findOne({ jsonStringSearch });
};

export const createSearchRecord = async (searchParams: PlantSearchParams) => {
  // Converting polygon will error out with invalid input, test conversion before creating
  convertPolygon(searchParams.boundingPolyCoords);

  const jsonStringSearch = stringifySearch(searchParams);

  const insertedRecord = await gbifSearchesCollection.insertOne({
    jsonStringSearch,
    status: "READY",
    statusUpdated: Date.now(),
    occurrencesOffset: 0,
    originalSearch: searchParams,
  });

  return (
    insertedRecord.insertedId &&
    gbifSearchesCollection.findOne(new ObjectId(insertedRecord.insertedId))
  );
};

export const updateSearchRecordResults = (
  searchRecord: SearchRecordDocument,
  scrapeResults?: OccurrenceScrapeResponse
) => {
  console.info(
    "close search record",
    searchRecord._id,
    "; current total occurrences searched:",
    searchRecord.occurrencesOffset,
    "; new occurrences found:",
    scrapeResults?.totalOccurrencesScraped,
    "; end of records?",
    scrapeResults?.endOfRecords
  );

  // Enforce strict typechecking on the updated record
  const updatedSearchRecord: Omit<
    OptionalId<SearchRecordDocument>,
    "jsonStringSearch" | "originalSearch"
  > = {
    statusUpdated: Date.now(),
    status: scrapeResults?.endOfRecords ? "COMPLETE" : "READY",
    occurrencesOffset:
      searchRecord.occurrencesOffset +
      (scrapeResults ? scrapeResults?.totalOccurrencesScraped : 0),
  };

  return gbifSearchesCollection.updateOne(
    { _id: searchRecord._id },
    {
      $set: updatedSearchRecord,
    }
  );
};
