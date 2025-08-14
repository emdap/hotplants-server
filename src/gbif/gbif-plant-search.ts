import { lookupPlantByName } from "../internal-db/internal-plant-search";
import {
  gbifClient,
  GbifOccurenceResult,
  GbifOccurrenceSearchQuery,
} from "./gbif-config";

type GbifResultDict = Record<string, GbifOccurenceResult>;

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

  return data?.results && combineGbifPlantResults(data.results);
};

const extractScientificName = ({
  scientificName,
  scientificNameAuthorship,
}: GbifOccurenceResult) =>
  scientificNameAuthorship
    ? scientificName?.split(scientificNameAuthorship)[0].trim()
    : scientificName;

const combineGbifPlantResults = (gbifResults: GbifOccurenceResult[]) =>
  gbifResults.reduce<GbifResultDict>((prev, result) => {
    const plantKey = extractScientificName(result);
    if (!plantKey) {
      return prev;
    }
    if (prev[plantKey] && result.media) {
      prev[plantKey].media.push(...result.media);
    } else {
      prev[plantKey] = result;
    }

    return prev;
  }, {});

export const storeGbifSearchResults = async (gbifResults: GbifResultDict) => {
  const fullData = await Promise.all(
    Object.entries(gbifResults).map(async ([plantKey, plant]) =>
      // TODO: save some GBIF data like coords, images
      lookupPlantByName(plantKey)
    )
  );

  return fullData.filter((plant) => !!plant);
};
