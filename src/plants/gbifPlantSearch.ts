import { gbifClient, GbifOccurrenceSearchQuery } from "../config/gbifClient";
import { PlantData } from "../config/mongodbClient";
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
}: GbifOccurrenceSearchQuery = {}) => {
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
    const storagePromises: Promise<unknown>[] = [];
    const filteredData: PlantData[] = [];

    combinedData.forEach((plant) => {
      if (plant) {
        const { needsUpdate, ...plantData } = plant;

        if (!("_id" in plantData)) {
          storagePromises.push(storePlantData(plantData));
          filteredData.push(plantData);
        } else {
          needsUpdate && storagePromises.push(storePlantData(plantData));
          const { _id, ...plantDataWithoutId } = plantData;
          filteredData.push(plantDataWithoutId);
        }
      }
    });

    await Promise.all(storagePromises);
    return filteredData;
  }
};
