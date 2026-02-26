import { Feature, Polygon } from "geojson";
import { Document, ObjectId } from "mongodb";
import {
  gbifSearchesCollection,
  plantArrayValuesCollection,
  plantsCollection,
} from "../../config/mongodbClient";
import {
  PartialPlantData,
  PlantDataDocument,
  PlantFilterableArrayField,
  PlantSearchParams,
  SearchRecordDocument,
} from "../../config/types";
import { searchGbifSpecies } from "./gbifUtil";
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

  const plantPromise = _id
    ? plantsCollection.updateOne({ _id }, { $set: fullData })
    : plantsCollection.insertOne({ _id: new ObjectId(), ...fullData });
  const arrayValuesPromise = updatePlantDataArrayValues(fullData);

  return Promise.all([plantPromise, arrayValuesPromise]);
};

export const lookupPlantByCoordinates = async ({
  geometry,
}: Feature<Polygon>) =>
  plantsCollection
    .find({
      occurrenceCoords: { $geoIntersects: { $geometry: geometry } },
    })
    .toArray();

export const createSearchRecord = async ({
  locationName,
  locationSource,
  boundingPolyCoords,
  commonName,
  scientificName,
}: PlantSearchParams) => {
  // Converting polygon will error out with invalid input, test conversion before creating
  convertPolygon(boundingPolyCoords);
  // Don't want to store the converted-polygon, easier to parse raw. Converted style is for GBIF API

  let taxonKeys: number[] | undefined;
  if (commonName) {
    taxonKeys = await searchGbifSpecies(commonName.trim());
  }

  const insertedRecord = await gbifSearchesCollection.insertOne({
    _id: new ObjectId(),

    status: "READY",
    createdTimestamp: Date.now(),

    locationName: locationName.trim(),
    locationSource,
    boundingPolyCoords,
    commonName: commonName?.trim(),
    scientificName: scientificName?.trim(),
    taxonKeys,

    totalOccurrences: 0,
    occurrencesOffset: 0,
  });

  return (
    insertedRecord.insertedId &&
    gbifSearchesCollection.findOne(new ObjectId(insertedRecord.insertedId))
  );
};

export const finishRunningSearch = (
  searchRecord: SearchRecordDocument,
  searchResults: {
    occurrencesProcessed: number;
    endOfRecords: boolean;
  } | null,
  debug?: boolean,
) => {
  debug &&
    console.info(
      `close search record ${searchRecord._id}
        current total occurrences searched: ${searchRecord.occurrencesOffset}
      \nsearch ran: ${Boolean(searchResults)}
        total occurrences found: ${searchResults?.occurrencesProcessed}
        end of records: ${searchResults?.endOfRecords}`,
    );

  const updatedSearchRecord: Partial<SearchRecordDocument> = {
    lastRanTimestamp: Date.now(),
    status: searchResults?.endOfRecords ? "COMPLETE" : "READY",

    occurrencesOffset:
      searchRecord.occurrencesOffset +
      (searchResults?.occurrencesProcessed ?? 0),
  };

  return updateSearchRecord(searchRecord._id, updatedSearchRecord);
};

export const updateSearchRecord = (
  searchRecordId: ObjectId,
  newData: Partial<SearchRecordDocument>,
) =>
  gbifSearchesCollection.findOneAndUpdate(
    { _id: searchRecordId },
    {
      $set: newData,
    },
    { returnDocument: "after" },
  );

const updatePlantDataArrayValues = (
  plantData: Omit<PlantDataDocument, "_id">,
) => {
  // TS definition ensures all array fields are present
  const plantArrayFieldsGrouping: Record<PlantFilterableArrayField, Document> =
    {
      bloomColors: { $each: plantData.bloomColors ?? [] },
      bloomTimes: { $each: plantData.bloomTimes ?? [] },
      hardiness: { $each: plantData.hardiness ?? [] },
      habitats: { $each: plantData.habitats ?? [] },
      lightLevels: { $each: plantData.lightLevels ?? [] },
      soilTypes: { $each: plantData.soilTypes ?? [] },
    };

  return plantArrayValuesCollection.updateOne(
    {},
    {
      $addToSet: plantArrayFieldsGrouping,
    },
    { upsert: true },
  );
};
