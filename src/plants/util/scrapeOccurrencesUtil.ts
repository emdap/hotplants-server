import { WithId } from "mongodb";
import { stringify } from "wkt";
import {
  gbifClient,
  GbifOccurrenceSearchParams,
} from "../../config/gbifClient";
import { OccurrenceScrapeResponse } from "../../config/types";
import { SearchRecord } from "../../graphql/graphql";
import { parseBboxInput } from "../../graphql/queryResolvers";
import { processGbifPlants, searchGbifSpecies } from "./gbifUtil";
import { closeGbifSearchRecord, PlantSearchParams } from "./mongodbUtil";

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

export const shouldStartScraping = (searchRecord: SearchRecord) => {
  if (searchRecord.endOfRecords) {
    return false;
  }

  if (searchRecord.status === "SCRAPING") {
    const now = Date.now();
    const timeDifference = now - searchRecord.statusUpdated;
    return timeDifference >= MAX_STALE_SEARCH_MILLISECONDS;
  }

  return true;
};

export const searchGbifOccurrences = async (
  gbifQuery: GbifOccurrenceSearchParams,
  searchRecord: WithId<SearchRecord>
) => {
  let scrapeResult = EMPTY_OCCURRENCE_SCRAPE_RESPONSE;
  try {
    const { data } = await gbifClient.GET("/occurrence/search", {
      params: {
        query: {
          ...gbifQuery,
          offset: searchRecord.totalOccurrences,
        },
      },
    });

    if (data?.results) {
      await processGbifPlants(data.results);
      scrapeResult = {
        totalOccurrencesScraped: data.results.length,
        endOfRecords: Boolean(data.endOfRecords),
      };
    }
  } catch (error) {
    console.error(error);
  }

  closeGbifSearchRecord(searchRecord, scrapeResult);
};

export const createGbifQuery = async (
  body: PlantSearchParams | null = {}
): Promise<GbifOccurrenceSearchParams> => {
  const { boundingBox, commonName, scientificName, ...searchParams } = {
    ...body,
    ...DEFAULT_GBIF_SEARCH_PARAMS,
  };

  const bboxPoly = boundingBox && parseBboxInput(boundingBox);
  const geometry = bboxPoly ? ([stringify(bboxPoly)] as string[]) : undefined;

  const taxonKey = commonName ? await searchGbifSpecies(commonName) : undefined;

  return {
    geometry,
    taxonKey,
    scientificName: scientificName ? [scientificName] : undefined,
    ...searchParams,
  };
};
