import { lookupPlantByName } from "../internal-db/internal-plant-search";
import {
  gbifClient,
  GbifOccurrenceSearchQuery,
  GbifOccurrenceSearchResult,
} from "./gbif-config";

const searchGbifSpecies = async (searchText: string) => {
  const { data } = await gbifClient.GET("/species/search", {
    params: {
      query: {
        higherTaxonKey: "6",
        limit: 100,
        q: searchText,
      },
    },
  });

  return data?.results?.flatMap(({ key }) => key ?? []);
};

export const searchGbifPlants = async ({
  q: searchText,
  ...query
}: GbifOccurrenceSearchQuery) => {
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
        limit: 2,
        taxonKey: taxonKeys,
        ...query,
      },
    },
  });

  return data?.results;
};

export const storeGbifSearchResults = async (
  gbifResults: GbifOccurrenceSearchResult
) => {
  const fullData = await Promise.all(
    gbifResults.map(async (plant) => {
      if (!plant.scientificName) {
        return null;
      }

      const lowercaseName = plant.scientificNameAuthorship
        ? plant.scientificName?.split(plant.scientificNameAuthorship)[0].trim()
        : plant.scientificName;

      return lookupPlantByName(lowercaseName) || [];
    })
  );

  return fullData.filter((plant) => !!plant);
};
