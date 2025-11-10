import { stringify } from "wkt";
import {
  gbifClient,
  GbifOccurrenceSearchParams,
} from "../../config/gbifClient";
import {
  OccurrenceScrapeResponse,
  PlantSearchParams,
  SearchRecordDocument,
} from "../../config/types";
import { parseBboxInput } from "../../graphql/resolvers/plantSearchResolver";
import { processGbifPlants, searchGbifSpecies } from "./gbifUtil";
import { updateSearchRecordResults } from "./mongodbUtil";

const EMPTY_OCCURRENCE_SCRAPE_RESPONSE: OccurrenceScrapeResponse = {
  totalOccurrencesScraped: 0,
  endOfRecords: false,
};

const DEFAULT_GBIF_SEARCH_PARAMS: PlantSearchParams = {
  kingdomKey: [6],
  basisOfRecord: ["HUMAN_OBSERVATION", "OBSERVATION", "MACHINE_OBSERVATION"],
  limit: 300,
  // @ts-expect-error API spec is incorrect
  mediaType: "StillImage",
};

const MAX_STALE_SEARCH_MILLISECONDS = 300000; // 5 minutes

export type SearchRecordResponse = { id: string } & Pick<
  SearchRecordDocument,
  "status" | "occurrencesOffset"
>;

export const extractSearchRecordResponse = ({
  _id,
  status,
  occurrencesOffset,
}: SearchRecordDocument): SearchRecordResponse => ({
  id: _id.toString(),
  status: status,
  occurrencesOffset: occurrencesOffset,
});

export const shouldStartScraping = ({
  status,
  statusUpdated,
}: SearchRecordDocument) => {
  switch (status) {
    case "READY":
      return true;
    case "SCRAPING":
      const now = Date.now();
      const timeDifference = now - statusUpdated;
      return timeDifference >= MAX_STALE_SEARCH_MILLISECONDS;
    default:
      return false;
  }
};

export const searchGbifOccurrences = async (
  gbifQuery: GbifOccurrenceSearchParams,
  searchRecord: SearchRecordDocument
) => {
  let scrapeResult = EMPTY_OCCURRENCE_SCRAPE_RESPONSE;
  try {
    const { data } = await gbifClient.GET("/occurrence/search", {
      params: {
        query: {
          ...gbifQuery,
          offset: searchRecord.occurrencesOffset,
        },
      },
    });

    if (data?.results) {
      await processGbifPlants(data.results);
      scrapeResult = {
        totalOccurrencesScraped: data.results.length,
        endOfRecords: Boolean(data.endOfRecords),
      };
    } else {
      scrapeResult = { totalOccurrencesScraped: 0, endOfRecords: true };
    }
  } catch (error) {
    console.error(error);
  }

  updateSearchRecordResults(searchRecord, scrapeResult);
};

/** Convert the coordinates to a polygon. Will error out if format is incorrect. */
export const convertPolygon = (boundingPolyCoords?: number[][][] | null) => {
  const validPoly = boundingPolyCoords && parseBboxInput(boundingPolyCoords);
  return validPoly ? ([stringify(validPoly)] as string[]) : undefined;
};

export const createGbifQuery = async (
  body: PlantSearchParams
): Promise<GbifOccurrenceSearchParams> => {
  const { boundingPolyCoords, commonName, scientificName, ...searchParams } = {
    ...body,
    ...DEFAULT_GBIF_SEARCH_PARAMS,
  };

  const geometry = convertPolygon(boundingPolyCoords);

  const taxonKey = commonName ? await searchGbifSpecies(commonName) : undefined;

  return {
    geometry,
    taxonKey,
    scientificName: scientificName ? [scientificName] : undefined,
    ...searchParams,
  };
};
