import { gbifClient, GbifOccurenceResult } from "../../config/gbifClient";
import {
  EntityType,
  PlantData,
  PlantMedia,
  PlantOccurrence,
} from "../../graphqlConfig/graphql";
import { getEntityByName, storeEntityData } from "./mongodbUtil";
import {
  combineScrapedData,
  iteratePlantScrapers,
  WebsiteScrapedData,
} from "./scrapingUtil";

type NormalizedGbifResult = Omit<
  GbifOccurenceResult,
  "media" | "decimalLatitude" | "decimalLongitude"
> &
  Pick<PlantData, "scrapeSources" | "occurrences">;

export const ENTITY_TO_KINGDOM: Record<EntityType, number> = {
  plant: 6,
  animal: 1,
};

/**
 * A dictionary where the key is the plants scientific name, and the entry is
 * combined GBIF occurrence data into a single result object.
 */
export type GbifResultDict = Record<string, NormalizedGbifResult>;

const initCommonNamesArray = (
  gbifData: NormalizedGbifResult,
  commonNameSearch?: string | null,
) => {
  const commonNames: string[] = [];
  const trimmedSearch = commonNameSearch?.toLowerCase().trim();

  if (gbifData.genericName) {
    commonNames.push(gbifData.genericName.toLowerCase().trim());
  } else if (trimmedSearch && gbifData.genus) {
    commonNames.push(
      `${trimmedSearch} - ${gbifData.genus.toLowerCase().trim()}`,
    );
  }

  if (trimmedSearch) {
    commonNames.push(trimmedSearch.trim());
  }

  return commonNames;
};

const extractScientificName = ({
  scientificName,
  scientificNameAuthorship,
}: GbifOccurenceResult) =>
  scientificNameAuthorship
    ? scientificName?.split(scientificNameAuthorship)[0].trim()
    : scientificName;

export const searchGbifSpecies = async (
  commonName: string,
  entityType: EntityType,
) => {
  // TODO: Create way to get all species instead of capping out at 20 limit
  const { data } = await gbifClient.GET("/species/search", {
    params: {
      query: {
        limit: 20,
        higherTaxonKey: String(ENTITY_TO_KINGDOM[entityType]),
        q: commonName,
      },
    },
  });
  return data?.results?.flatMap(({ key }) => key ?? []);
};

const normalizeOccurrence = (gbifOccurrence: GbifOccurenceResult) => {
  const { media, decimalLatitude, decimalLongitude, ...rest } = gbifOccurrence;

  const mediaObjects: PlantMedia[] = media.map(({ identifier }) => ({
    url: identifier,
  }));

  const coordinates =
    decimalLatitude && decimalLongitude
      ? [decimalLongitude, decimalLatitude]
      : [];

  const normalizedOccurence: NormalizedGbifResult = {
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

  return normalizedOccurence;
};

const extractOccurrenceIds = (occurrences?: PlantOccurrence[]) =>
  occurrences ? occurrences.map(({ occurrenceId }) => occurrenceId) : [];

/** Combine GBIF occurrence results into a dictionary, where each entry is a unique plant,
 * and the value is all occurrence data for that plant in `gbifResults`, combined
 * into a single object.
 */
const reduceGbifResults = (gbifResults: GbifOccurenceResult[]) =>
  gbifResults.reduce<GbifResultDict>((prev, result) => {
    if (
      result.establishmentMeans === "vagrant" ||
      result.degreeOfEstablishment === "spreading"
    ) {
      return prev;
    }

    const scientificName = extractScientificName(result)?.toLowerCase();
    if (!scientificName) {
      return prev;
    }

    const existingOccurrenceIds = extractOccurrenceIds(
      prev[scientificName]?.occurrences,
    );

    if (!existingOccurrenceIds.includes(result.key)) {
      const normalizedOccurrence = normalizeOccurrence(result);
      if (prev[scientificName]) {
        prev[scientificName] = combineOccurrences(
          prev[scientificName],
          normalizedOccurrence,
        );
      } else {
        prev[scientificName] = normalizedOccurrence;
      }
    }

    return prev;
  }, {});

const combineOccurrences = <
  T extends Pick<PlantData, "scrapeSources" | "occurrences">,
>(
  normalizedData: T,
  newGbifData: NormalizedGbifResult,
): T & { hasNewData: boolean } => {
  const existingOccurrences = normalizedData.occurrences.map(
    ({ occurrenceId }) => occurrenceId,
  );
  const newOccurrences = newGbifData.occurrences.filter(
    ({ occurrenceId }) => !existingOccurrences.includes(occurrenceId),
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
 *
 * @returns number of new unique occurences found
 */
export const processGbifResults = async (
  gbifResults: GbifOccurenceResult[],
  entityType: EntityType,
  commonNameSearch?: string | null,
) => {
  const processGbifEntity = async (
    scientificName: string,
    occurrenceData: NormalizedGbifResult,
  ) => {
    const existingData = await getEntityByName(scientificName, entityType);
    let combinedScrapedData: WebsiteScrapedData | null = null;

    if (entityType === "plant") {
      const scrapedData = await Promise.all(
        iteratePlantScrapers(scientificName, existingData?.scrapeSources),
      );
      combinedScrapedData = combineScrapedData(scrapedData);
    }

    const normalizedData = {
      scientificName,
      occurrences: [],
      scrapeSources: [],
      // TODO: TEMP - want way to store the common name search that revealed this GBIF result for animals (no scraped data to get accurate commonNames)
      commonNames: initCommonNamesArray(occurrenceData, commonNameSearch),
      ...existingData,
      ...combinedScrapedData,
    };

    const { hasNewData, ...combinedData } = combineOccurrences(
      normalizedData,
      occurrenceData,
    );

    if (hasNewData) {
      await storeEntityData(combinedData, entityType);
    }

    return combinedData;
  };

  const resultDict = reduceGbifResults(gbifResults);

  return Promise.all(
    Object.entries(resultDict).map((plantEntry) =>
      processGbifEntity(...plantEntry),
    ),
  );
};
