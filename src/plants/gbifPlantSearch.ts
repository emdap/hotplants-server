import { InsertOneResult, UpdateResult } from "mongodb";
import { gbifClient, GbifOccurrenceSearchParams } from "../config/gbifClient";
import { PlantData, PlantResponse } from "../config/types";
import {
  combineGbifData,
  GbifResultDict,
  normalizeGbifPlants,
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
        kingdomKey: [6],
        basisOfRecord: [
          "HUMAN_OBSERVATION",
          "OBSERVATION",
          "MACHINE_OBSERVATION",
        ],
        // @ts-expect-error TODO: Passing string rather than serializing nested object into string -- default serialization not accepted by API
        mediaType: "StillImage",
        limit: 5,
        taxonKey: taxonKeys,
        ...query,
      },
    },
  });

  return data?.results && normalizeGbifPlants(data.results);
};

export const getCompletedGbifPlants = async (gbifResults: GbifResultDict) => {
  const combinedData = await Promise.all(
    Object.entries(gbifResults).map(async ([plantKey, plant]) => {
      const plantData = await lookupPlantByName(plantKey);
      return plantData && combineGbifData(plantData, plant);
    })
  );

  if (combinedData.length) {
    const { storagePromises, plantResponse } = combinedData.reduce<{
      storagePromises: Promise<
        UpdateResult<PlantData> | InsertOneResult<PlantData>
      >[];
      plantResponse: PlantResponse[];
    }>(
      (prev, { _id, needsUpdate, ...plant }) => {
        if (!_id || needsUpdate) {
          prev.storagePromises.push(storePlantData(plant));
        }
        if (plant.scrapeSuccessful) {
          const { scrapeSuccessful, ...rest } = plant;
          prev.plantResponse.push(rest);
        }

        return prev;
      },
      { storagePromises: [], plantResponse: [] }
    );

    await Promise.all(storagePromises);
    return plantResponse;
  }
};
