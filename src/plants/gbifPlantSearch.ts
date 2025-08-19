import { gbifClient, GbifOccurrenceSearchQuery } from "../config/gbifClient";
import {
  combineGbifData,
  GbifResultDict,
  normalizeGbifPlants,
  searchGbifSpecies,
} from "./util/gbifUtil";
import { lookupPlantByName } from "./util/mongodbUtil";

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

export const storeCompletedGbifPlants = async (gbifResults: GbifResultDict) => {
  const completedData = await Promise.all(
    Object.entries(gbifResults).map(async ([plantKey, plant]) => {
      const plantData = await lookupPlantByName(plantKey);
      return plantData && combineGbifData(plantData, plant);
    })
  );

  if (completedData.length) {
    return completedData.filter((plant) => !!plant);
  }

  return;
};
