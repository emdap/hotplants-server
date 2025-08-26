import { InsertOneResult, UpdateResult } from "mongodb";
import { gbifClient, GbifOccurrenceSearchParams } from "../config/gbifClient";
import { PlantDataDocument } from "../config/types";
import {
  combineGbifData,
  GbifResultDict,
  reduceGbifResults,
  searchGbifSpecies,
} from "./util/gbifUtil";
import {
  getGbifSearchRecord,
  lookupPlantByName,
  storePlantData,
  updateGbifSearchRecord,
} from "./util/mongodbUtil";

export const searchGbifPlants = async ({
  q: searchText,
  ...searchParams
}: GbifOccurrenceSearchParams) => {
  const taxonKeys = searchText
    ? await searchGbifSpecies(searchText)
    : undefined;

  const query = {
    taxonKey: taxonKeys,
    ...searchParams,
  };

  const searchRecord = await getGbifSearchRecord(query);
  console.log(searchRecord);

  if (searchRecord) {
    // Always requesting a limit of 100, but doubly enforcing previous limit here so that
    // the offset definitely matches up
    query.limit = searchRecord.pageSize;
    query.offset = searchRecord.pageSize * (searchRecord.lastPageSearched + 1);
  }

  const { data } = await gbifClient.GET("/occurrence/search", {
    params: {
      query,
    },
  });

  data && searchRecord && (await updateGbifSearchRecord(searchRecord, data));

  return data?.results && reduceGbifResults(data.results);
};

export const getCompletedGbifPlants = async (gbifResults: GbifResultDict) => {
  const combinedData = await Promise.all(
    Object.entries(gbifResults).map(async ([plantKey, plant]) => {
      const scrapedPlantData = await lookupPlantByName(plantKey);
      return combineGbifData(scrapedPlantData, plant);
    })
  );

  if (combinedData.length) {
    const { storagePromises, plantData } = combinedData.reduce<{
      storagePromises: Promise<
        UpdateResult<PlantDataDocument> | InsertOneResult<PlantDataDocument>
      >[];
      plantData: PlantDataDocument[];
    }>(
      (prev, { needsUpdate, ...plant }) => {
        needsUpdate && prev.storagePromises.push(storePlantData(plant));
        plant.scrapeSources?.length && prev.plantData.push(plant);

        return prev;
      },
      { storagePromises: [], plantData: [] }
    );

    await Promise.all(storagePromises);

    return plantData;
  }

  return [];
};
