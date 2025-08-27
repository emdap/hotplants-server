import { gbifClient, GbifOccurenceResult } from "../../config/gbifClient";
import { CommonPlantData } from "../../config/types";

type NormalizedGbifResult = Omit<
  GbifOccurenceResult,
  "media" | "decimalLatitude" | "decimalLongitude"
> &
  Required<CommonPlantData>;

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

export const combineGbifData = <T extends CommonPlantData>(
  existingData: T,
  newGbifData: NormalizedGbifResult
) => {
  const combinedData = {
    ...existingData,
    mediaUrls: existingData.mediaUrls || [],
    occurrenceCoords: existingData.occurrenceCoords || [],
    needsUpdate: false,
    occurrenceIds: existingData.occurrenceIds || [],
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
        (coord) => coord[0] === newCoord[0] && coord[1] === newCoord[1]
      )
    ) {
      combinedData.occurrenceCoords.push(newCoord);
      combinedData.needsUpdate = true;
    }
  });

  return combinedData;
};
