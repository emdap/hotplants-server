import { EntityType } from "@/graphqlConfig/graphql";
import { Feature, Polygon } from "geojson";
import { Document, ObjectId } from "mongodb";
import {
  animalsCollection,
  gbifSearchesCollection,
  plantArrayValuesCollection,
  plantsCollection,
} from "../../config/mongodbClient";
import {
  EntitySearchParams,
  PartialPlantData,
  PlantDataDocument,
  PlantFilterableArrayField,
  SearchRecordDocument,
} from "../../config/types";
import { searchGbifSpecies } from "./gbifUtil";
import { convertPolygon } from "./scrapingUtil";

export const getEntityCollection = (entityType: EntityType) =>
  entityType === "plant" ? plantsCollection : animalsCollection;

export const trimEntityName = (
  entityName: EntitySearchParams["entityName"],
) => {
  if (!entityName) {
    return entityName;
  }

  if ("scientificName" in entityName) {
    return { scientificName: entityName.scientificName.toLowerCase().trim() };
  } else if ("commonName" in entityName) {
    return { commonName: entityName.commonName.toLowerCase().trim() };
  }
};

/**
 *
 * Helper function to return existing plant data from mongodb.
 *
 * @param scientificName The plant name to search for
 * @returns Data for the plant
 */
export const getEntityByName = (
  scientificName: string,
  entityType: EntityType,
) => {
  const lowercaseName = scientificName.toLowerCase();

  return getEntityCollection(entityType).findOne({
    scientificName: lowercaseName,
  });
};

export const storeEntityData = async (
  {
    _id,
    ...entityData
  }: PartialPlantData & { _id?: ObjectId; addedTimestamp?: number },
  entityType: EntityType,
) => {
  const unixTimestamp = Date.now();
  // Enforce strict typechecking
  const fullData: Omit<PlantDataDocument, "_id"> = {
    ...entityData,
    addedTimestamp: entityData.addedTimestamp ?? unixTimestamp,
    updatedTimestamp: unixTimestamp,
  };

  const storagePromise = _id
    ? getEntityCollection(entityType).updateOne({ _id }, { $set: fullData })
    : getEntityCollection(entityType).insertOne({
        _id: new ObjectId(),
        ...fullData,
      });

  const arrayValuesPromise =
    entityType === "plant" && updatePlantDataArrayValues(fullData);

  return Promise.all([storagePromise, arrayValuesPromise]);
};

export const lookupPlantByCoordinates = async ({
  geometry,
}: Feature<Polygon>) =>
  plantsCollection
    .find({
      occurrenceCoords: { $geoIntersects: { $geometry: geometry } },
    })
    .toArray();

export const createSearchRecord = async (
  { location, entityName, entityType }: EntitySearchParams,
  userId?: ObjectId,
) => {
  // Converting polygon will error out with invalid input, test conversion before creating
  convertPolygon(location?.boundingPolyCoords);
  // Don't want to store the converted-polygon, easier to parse raw. Converted style is for GBIF API

  let taxonKeys: number[] | undefined;

  if (entityName && "commonName" in entityName) {
    taxonKeys = await searchGbifSpecies(
      entityName.commonName.trim(),
      entityType,
    );
  }

  const insertedRecord = await gbifSearchesCollection.insertOne({
    _id: new ObjectId(),

    status: "READY",
    createdTimestamp: Date.now(),

    taxonKeys,
    totalOccurrences: 0,
    occurrencesOffset: 0,
    entityType,

    ...location,
    ...entityName,
    ...(userId && { userIds: [userId] }),
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
  userId?: ObjectId,
) =>
  gbifSearchesCollection.findOneAndUpdate(
    { _id: searchRecordId },
    {
      $set: newData,
      ...(userId && { $addToSet: { userIds: userId } }),
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
      // TODO: Fix habitat scraping to group into categories -- right now
      // it's a random sentence
      habitats: { $each: [] },
      // habitats: { $each: plantData.habitats ?? [] },
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
