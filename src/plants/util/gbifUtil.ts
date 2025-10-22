import { gbifClient, GbifOccurenceResult } from "../../config/gbifClient";
import { PlantData, PlantMedia, PlantOccurrence } from "../../graphql/graphql";
import { scrapePlantByname } from "../pfafScraper";
import { getPlantByName, storePlantData } from "./mongodbUtil";

type NormalizedGbifResult = Omit<
  GbifOccurenceResult,
  "media" | "decimalLatitude" | "decimalLongitude"
> &
  Pick<PlantData, "scrapeSources" | "occurrences">;

/**
 * A dictionary where the key is the plants scientific name, and the entry is
 * combined GBIF occurrence data into a single result object.
 */
export type GbifResultDict = Record<string, NormalizedGbifResult>;

const extractScientificName = ({
  scientificName,
  scientificNameAuthorship,
}: GbifOccurenceResult) =>
  scientificNameAuthorship
    ? scientificName?.split(scientificNameAuthorship)[0].trim()
    : scientificName;

export const searchGbifSpecies = async (commonName: string) => {
  // TODO: Create way to get all species instead of capping out at 100 limit
  const { data } = await gbifClient.GET("/species/search", {
    params: {
      query: {
        limit: 5,
        higherTaxonKey: "6",
        q: commonName,
      },
    },
  });
  return data?.results?.flatMap(({ key }) => key ?? []);
};

const normalizePlant = (gbifOccurrence: GbifOccurenceResult) => {
  const { media, decimalLatitude, decimalLongitude, ...rest } = gbifOccurrence;

  const mediaObjects: PlantMedia[] = media.map(({ identifier }) => ({
    url: identifier,
  }));

  const coordinates =
    decimalLatitude && decimalLongitude
      ? [decimalLongitude, decimalLatitude]
      : [];

  const normalizedPlant: NormalizedGbifResult = {
    ...rest,
    scrapeSources: [],
    occurrences: [
      {
        occurrenceId: gbifOccurrence.key,
        occurrenceCoords: coordinates,
        media: mediaObjects,
      },
    ],
  };

  return normalizedPlant;
};

const extractOccurrenceIds = (occurrences?: PlantOccurrence[]) =>
  occurrences ? occurrences.map(({ occurrenceId }) => occurrenceId) : [];

/** Combine GBIF occurrence results into a dictionary, where each entry is a unique plant,
 * and the value is all occurrence data for that plant in `gbifResults`, combined
 * into a single object.
 */
const reduceGbifResults = (gbifResults: GbifOccurenceResult[]) =>
  gbifResults.reduce<GbifResultDict>((prev, result) => {
    const plantKey = extractScientificName(result);
    if (!plantKey) {
      return prev;
    }

    const existingOccurrenceIds = extractOccurrenceIds(
      prev[plantKey]?.occurrences
    );

    if (!existingOccurrenceIds.includes(result.key)) {
      const normalizedGbifPlant = normalizePlant(result);
      if (prev[plantKey]) {
        prev[plantKey] = combinePlantData(prev[plantKey], normalizedGbifPlant);
      } else {
        prev[plantKey] = normalizedGbifPlant;
      }
    }

    return prev;
  }, {});

const combinePlantData = <
  T extends Pick<PlantData, "scrapeSources" | "occurrences">
>(
  normalizedData: T,
  newGbifData: NormalizedGbifResult
): T & { hasNewData: boolean } => {
  const existingOccurrences = normalizedData.occurrences.map(
    ({ occurrenceId }) => occurrenceId
  );
  const newOccurrences = newGbifData.occurrences.filter(
    ({ occurrenceId }) => !existingOccurrences.includes(occurrenceId)
  );

  const combinedData = {
    ...normalizedData,
    hasNewData: false,
  };

  if (!newOccurrences.length) {
    return combinedData;
  }

  combinedData.hasNewData = true;
  combinedData.occurrences.push(...newOccurrences);

  return combinedData;
};

/**
 * Iterate a dictionary of GBIF occurrence results, and return an array of processed results.
 * Combine the incoming occurrence data with either data that already exists in the database,
 * or scraped data for the plant from PFAF.
 *
 * @param gbifResults GBIF occurrence results directly from GBIF occurrence API
 */
export const processGbifPlants = (gbifResults: GbifOccurenceResult[]) => {
  const processGbifPlant = async (
    plantKey: string,
    occurrenceData: NormalizedGbifResult
  ) => {
    const existingPlantData = await getPlantByName(plantKey);
    const plantData = existingPlantData ?? (await scrapePlantByname(plantKey));

    const { hasNewData, ...combinedData } = combinePlantData(
      plantData,
      occurrenceData
    );

    if (hasNewData) {
      await storePlantData(combinedData);
    }

    return combinedData;
  };

  const resultDict = reduceGbifResults(gbifResults);

  return Promise.all(
    Object.entries(resultDict).map((plantEntry) =>
      processGbifPlant(...plantEntry)
    )
  );
};
