import { PlantData } from "../internal-db/mongo-config";
import { gbifClient, GbifOccurenceResult } from "./gbif-config";

type CommonPlantData = Pick<PlantData, "occurrenceCoords" | "mediaUrls">;

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
        limit: 100,
        q: searchText,
      },
    },
  });

  return data?.results?.flatMap(({ key }) => key ?? []);
};

export const normalizeGbifPlants = (gbifResults: GbifOccurenceResult[]) =>
  gbifResults.reduce<GbifResultDict>((prev, result) => {
    const plantKey = extractScientificName(result);
    if (!plantKey) {
      return prev;
    }

    const { media, decimalLatitude, decimalLongitude, ...rest } = result;
    const normalizedPlant: NormalizedGbifResult = {
      ...rest,
      mediaUrls: media.map(({ identifier }) => identifier),
      occurrenceCoords: [],
    };

    if (decimalLatitude && decimalLongitude) {
      normalizedPlant.occurrenceCoords.push([
        decimalLongitude,
        decimalLatitude,
      ]);
    }

    if (prev[plantKey]) {
      prev[plantKey] = combineGbifData(prev[plantKey], normalizedPlant);
    } else {
      prev[plantKey] = normalizedPlant;
    }

    return prev;
  }, {});

export const combineGbifData = <T extends CommonPlantData>(
  existingData: T,
  addData: NormalizedGbifResult
) => {
  const combinedData: T & Required<CommonPlantData> = {
    ...existingData,
    mediaUrls: existingData.mediaUrls || [],
    occurrenceCoords: existingData.occurrenceCoords || [],
  };

  if (addData.mediaUrls?.length) {
    combinedData.mediaUrls.push(...addData.mediaUrls);
  }

  if (addData.occurrenceCoords) {
    combinedData.occurrenceCoords.push(...addData.occurrenceCoords);
  }

  return combinedData;
};
