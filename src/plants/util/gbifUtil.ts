import { InsertOneResult, UpdateResult } from "mongodb";
import { gbifClient, GbifOccurenceResult } from "../../config/gbifClient";
import {
  GbifDataArrays,
  PartialPlantData,
  PlantDataDocument,
} from "../../config/types";
import { PlantData } from "../../graphql/graphql";
import { lookupPlantByName, storePlantData } from "./mongodbUtil";

type NormalizedGbifResult = Omit<
  GbifOccurenceResult,
  "media" | "decimalLatitude" | "decimalLongitude"
> &
  Required<GbifDataArrays> &
  Pick<PlantData, "scrapeSources">;

export type GbifResultDict = Record<string, NormalizedGbifResult>;

const extractScientificName = ({
  scientificName,
  scientificNameAuthorship,
}: GbifOccurenceResult) =>
  scientificNameAuthorship
    ? scientificName?.split(scientificNameAuthorship)[0].trim()
    : scientificName;

export const searchGbifSpecies = async (searchText: string) => {
  const { data } = await gbifClient.GET("/species/search", {
    params: {
      query: {
        higherTaxonKey: "6",
        q: searchText,
      },
    },
  });

  return data?.results?.flatMap(({ key }) => key ?? []);
};

const normalizePlant = (gbifOccurrence: GbifOccurenceResult) => {
  const { media, decimalLatitude, decimalLongitude, ...rest } = gbifOccurrence;
  const normalizedPlant: NormalizedGbifResult = {
    ...rest,
    mediaUrls: media.map(({ identifier }) => identifier),
    occurrenceCoords: [],
    occurrenceIds: [gbifOccurrence.key],
    scrapeSources: [],
  };

  if (decimalLatitude && decimalLongitude) {
    normalizedPlant.occurrenceCoords.push([decimalLongitude, decimalLatitude]);
  }

  return normalizedPlant;
};

export const reduceGbifResults = (gbifResults: GbifOccurenceResult[]) =>
  gbifResults.reduce<GbifResultDict>((prev, result) => {
    const plantKey = extractScientificName(result);
    if (!plantKey) {
      return prev;
    }

    if (!prev[plantKey] || !prev[plantKey].occurrenceIds.includes(result.key)) {
      const normalizedGbifPlant = normalizePlant(result);
      if (prev[plantKey]) {
        prev[plantKey] = combineGbifData(prev[plantKey], normalizedGbifPlant);
      } else {
        prev[plantKey] = normalizedGbifPlant;
      }
    }

    return prev;
  }, {});

export const combineGbifData = <T extends GbifDataArrays>(
  existingData: T,
  newGbifData: NormalizedGbifResult
) => {
  const combinedData = {
    ...existingData,
    needsUpdate: false,
  };

  const newOccurrenceIds = newGbifData.occurrenceIds.filter(
    (id) => !combinedData.occurrenceIds.includes(id)
  );

  if (!newOccurrenceIds.length) {
    return combinedData;
  } else {
    combinedData.occurrenceIds.push(...newOccurrenceIds);
    combinedData.needsUpdate = true;
  }

  if (newGbifData.mediaUrls.length) {
    combinedData.mediaUrls = Array.from(
      new Set(combinedData.mediaUrls.concat(newGbifData.mediaUrls))
    );
    combinedData.needsUpdate = true;
  }

  newGbifData.occurrenceCoords.forEach((newCoord) => {
    if (
      !combinedData.occurrenceCoords.find(
        (coord) => coord && coord[0] === newCoord[0] && coord[1] === newCoord[1]
      )
    ) {
      combinedData.occurrenceCoords.push(newCoord);
      combinedData.needsUpdate = true;
    }
  });

  return combinedData;
};

/**
 *
 * Get completed plant result by combining GBIF occurrence data with existing data that's already
 * stored in mongodb, or scraping data from PFAF through a helper function. Toggle whether only
 * newly scraped results should be returned.
 *
 * @param gbifResults The occurrence results from GBIF that will be combined with additional data,
 * in order to return a complete plant
 * @param includeExisting Whether to return plants that already existed in mongodb
 * @returns A list of plants with complete data
 */
export const getCompletedGbifPlants = async (
  gbifResults: GbifResultDict,
  includeExisting: boolean
) => {
  const combinedData = await Promise.all(
    Object.entries(gbifResults).map(async ([plantKey, plant]) => {
      const { existing, data } = await lookupPlantByName(plantKey);
      return !existing || includeExisting ? combineGbifData(data, plant) : null;
    })
  );

  if (combinedData.length) {
    const { storagePromises, plantData } = combinedData.reduce<{
      storagePromises: Promise<
        UpdateResult<PlantDataDocument> | InsertOneResult<PlantDataDocument>
      >[];
      plantData: PartialPlantData[];
    }>(
      (prev, data) => {
        if (data) {
          const { needsUpdate, ...plant } = data;
          const storagePromise = storePlantData(plant);
          needsUpdate && prev.storagePromises.push(storagePromise);
          plant.scrapeSources?.length && prev.plantData.push(plant);
        }

        return prev;
      },
      { storagePromises: [], plantData: [] }
    );

    await Promise.all(storagePromises);

    return plantData;
  }

  return [];
};
