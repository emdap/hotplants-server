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

export type PlantSearchParams = Omit<
  GbifOccurrenceSearchParams,
  "geometry" | "scientificName"
> &
  // TODO: Strange error, if given PlantDataInput as-is, TSOA has error
  // "GenerateMetadataError: Cannot read properties of undefined (reading 'kind')""
  Omit<PlantDataInput, "">;

/**
 *
 * Helper function to return existing plant data from mongodb.
 *
 * @param scientificName The plant name to search for
 * @returns Data for the plant
 */
export const getPlantByName = (scientificName: string) => {
  const lowercaseName = scientificName.toLowerCase();
  return plantCollection.findOne({
    scientificName: lowercaseName,
  });
};

export const storePlantData = async ({
  _id,
  ...plantData
}: PartialPlantData & { _id?: ObjectId; addedTimestamp?: number }) => {
  const unixTimestamp = Date.now();
  // Enforce strict typechecking
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

  console.info("open search record", jsonStringSearch);

  return gbifSearchesCollection.findOneAndUpdate(
    {
      jsonStringSearch,
    },
    { $set: { status: "SCRAPING", lastAddedCount: undefined } }
  );
};

export const createGbifSearchRecord = async (
  searchParams: PlantSearchParams | null,
  initialStatus: SearchRecordStatus = "SCRAPING"
) => {
  const jsonStringSearch = stringifySearch(searchParams);

  const insertedRecord = await gbifSearchesCollection.insertOne({
    jsonStringSearch,
    status: initialStatus,
    statusUpdated: Date.now(),
    totalOccurrences: 0,
  });

  return (
    insertedRecord.insertedId &&
    gbifSearchesCollection.findOne(new ObjectId(insertedRecord.insertedId))
  );
};

export const closeGbifSearchRecord = (
  searchRecord: WithId<SearchRecord>,
  { totalOccurrencesScraped, endOfRecords }: OccurrenceScrapeResponse
) => {
  console.info(
    "close search record",
    searchRecord._id,
    "; current total occurrences:",
    searchRecord.totalOccurrences,
    "; new occurrences found:",
    totalOccurrencesScraped,
    "; end of records?",
    endOfRecords
  );

  // Enforce strict typechecking on the updated record
  const updatedSearchRecord: Omit<SearchRecord, "jsonStringSearch"> = {
    status: "DONE",
    statusUpdated: Date.now(),
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
