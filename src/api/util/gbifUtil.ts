import { PlantDataDocument } from "@/config/types";
import { gbifClient, GbifOccurenceResult } from "../../config/gbifClient";
import {
  EntityType,
  PlantData,
  PlantMedia,
  PlantOccurrence,
} from "../../graphqlConfig/graphql";
import { getEntityByName, storeEntityData } from "./mongodbUtil";
import { getScrapedData, WebsiteScrapedData } from "./scrapingUtil";

type NormalizedGbifResult = Omit<
  GbifOccurenceResult,
  "media" | "decimalLatitude" | "decimalLongitude"
> & { occurrences: PlantData["occurrences"] };

export const ENTITY_TO_KINGDOM: Record<EntityType, number> = {
  plant: 6,
  animal: 1,
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

const normalizeOccurrence = (
  gbifOccurrence: GbifOccurenceResult,
): NormalizedGbifResult["occurrences"][number] => {
  const { media, decimalLatitude, decimalLongitude } = gbifOccurrence;

  const mediaObjects: PlantMedia[] = media.map(({ identifier }) => ({
    url: identifier,
  }));

  const coordinates =
    decimalLatitude && decimalLongitude
      ? [decimalLongitude, decimalLatitude]
      : [];

  return {
    occurrenceId: gbifOccurrence.key,
    occurrenceCoords: coordinates,
    media: mediaObjects,
  };
};

const normalizeAndUpdateOccurrences = (
  existingOccurrences: NormalizedGbifResult["occurrences"],
  incomingResult: GbifOccurenceResult,
) => {
  const existingIds = existingOccurrences.map(
    ({ occurrenceId }) => occurrenceId,
  );

  if (existingIds.includes(incomingResult.key)) {
    return existingOccurrences;
  }

  return [...existingOccurrences, normalizeOccurrence(incomingResult)];
};

/**
 *  Combine GBIF occurrence results into a dictionary keyed by scientific names.
 */
const combineGbifResults = (gbifResults: GbifOccurenceResult[]) =>
  gbifResults.reduce<Record<string, NormalizedGbifResult>>((prev, result) => {
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

    if (prev[scientificName]) {
      prev[scientificName].occurrences = normalizeAndUpdateOccurrences(
        prev[scientificName].occurrences,
        result,
      );
    } else if (result) {
      prev[scientificName] = {
        ...result,
        occurrences: [normalizeOccurrence(result)],
      };
    }

    return prev;
  }, {});

/**
 * GBIF species search based on a common name does not include a list of
 * matched common names for the returned species.
 * Manually add the searched common name to the entity.
 */
const getUpdatedCommonNames = (
  { genericName, genus }: NormalizedGbifResult,
  commonNameSearch: string | null | undefined,
  {
    existingData,
    scrapedData,
  }: {
    existingData?: Pick<PlantDataDocument, "commonNames"> | null;
    scrapedData?: Pick<WebsiteScrapedData, "commonNames"> | null;
  },
) => {
  const commonNames = new Set<string>(existingData?.commonNames);
  const startingSize = commonNames.size;

  scrapedData?.commonNames?.forEach((commonName) =>
    commonNames.add(commonName),
  );

  const trimmedSearch = commonNameSearch?.toLowerCase().trim();

  if (trimmedSearch) {
    const nameSuffix = genericName || genus;

    nameSuffix &&
      commonNames.add(`${trimmedSearch} - ${nameSuffix.toLowerCase().trim()}`);

    commonNames.add(trimmedSearch);
  }

  return startingSize === commonNames.size ? null : [...commonNames];
};

const getUpdatedOccurrences = (
  { occurrences }: NormalizedGbifResult,
  baseOccurrences?: PlantOccurrence[],
) => {
  if (!baseOccurrences) {
    return occurrences;
  }

  const existingOccurrenceIds = baseOccurrences.map(
    ({ occurrenceId }) => occurrenceId,
  );
  const newOccurrences = occurrences.filter(
    ({ occurrenceId }) => !existingOccurrenceIds.includes(occurrenceId),
  );

  return newOccurrences.length ? baseOccurrences.concat(newOccurrences) : null;
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
    incomingData: NormalizedGbifResult,
  ) => {
    const existingData = await getEntityByName(scientificName, entityType);

    const newScrapedData = await getScrapedData(
      scientificName,
      entityType,
      existingData?.scrapeSources,
    );

    const updatedCommonNames = getUpdatedCommonNames(
      incomingData,
      commonNameSearch,
      {
        existingData,
        scrapedData: newScrapedData,
      },
    );

    const updatedOccurrences = getUpdatedOccurrences(
      incomingData,
      existingData?.occurrences,
    );

    const combinedData = {
      scrapeSources: [],
      ...existingData,
      ...newScrapedData,

      scientificName,
      commonNames: updatedCommonNames ?? existingData?.commonNames ?? undefined,
      occurrences: updatedOccurrences ?? existingData?.occurrences ?? [],
    };

    if (newScrapedData || updatedCommonNames || updatedOccurrences) {
      await storeEntityData(combinedData, entityType);
    }

    return combinedData;
  };

  const resultDict = combineGbifResults(gbifResults);

  return Promise.all(
    Object.entries(resultDict).map(([scientificName, data]) =>
      processGbifEntity(scientificName, data),
    ),
  );
};
