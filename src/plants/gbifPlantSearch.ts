import { InsertOneResult, UpdateResult } from "mongodb";
import { gbifClient, GbifOccurrenceSearchParams } from "../config/gbifClient";
import { PlantDataRaw } from "../config/types";
import {
  combineGbifData,
  GbifResultDict,
  reduceGbifResults,
  searchGbifSpecies,
} from "./util/gbifUtil";
import { lookupPlantByName, storePlantData } from "./util/mongodbUtil";

export const searchGbifPlants = async ({
  q: searchText,
  ...query
}: GbifOccurrenceSearchParams) => {
  const taxonKeys = searchText
    ? await searchGbifSpecies(searchText)
    : undefined;

  const { data } = await gbifClient.GET("/occurrence/search", {
    params: {
      query: {
        taxonKey: taxonKeys,
        ...query,
      },
    },
  });

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
        UpdateResult<PlantDataRaw> | InsertOneResult<PlantDataRaw>
      >[];
      plantData: PlantDataRaw[];
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
