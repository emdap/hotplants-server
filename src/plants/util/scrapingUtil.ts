import { stringify } from "wkt";
import {
  gbifClient,
  GbifOccurrenceSearchParams,
} from "../../config/gbifClient";
import {
  OccurrenceScrapeResponse,
  PartialPlantData,
  PlantSearchParams,
  SearchRecordDocument,
} from "../../config/types";
import { parseBboxInput } from "../../graphql/resolvers/plantSearchResolver";
import { scrapePermaPeople } from "../permaPeopleScraper";
import { scrapePFAF } from "../pfafScraper";
import { processGbifResults, searchGbifSpecies } from "./gbifUtil";
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

type WebsiteScrapedData = Omit<
  PartialPlantData,
  "scientificName" | "occurrences"
>;

export type WebsiteScrapedDataWithSource = WebsiteScrapedData & {
  source: ScrapeSource;
};

export type ScrapeSource = "pfaf" | "perma";

export const SCRAPE_SOURCE_INFO: Record<
  ScrapeSource,
  { url: string; spaceReplacement: string }
> = {
  pfaf: {
    url: "https://pfaf.org/user/Plant.aspx?LatinName=",
    spaceReplacement: "+",
  },
  perma: { url: "https://permapeople.org/plants/", spaceReplacement: "-" },
};

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
      await processGbifResults(data.results);
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

export const iteratePlantScrapers = (
  scientificName: string,
  previousScrapeSources?: string[]
) =>
  Object.keys(SCRAPE_SOURCE_INFO).map((source) => {
    const scrapeSource = source as ScrapeSource;
    const scrapeUrl = getScrapeUrl(scientificName, scrapeSource);

    if (!previousScrapeSources?.includes(scrapeUrl)) {
      return scrapePlantByName(scientificName, scrapeSource);
    }

    return null;
  });

export const scrapePlantByName = async (
  scientificName: string,
  scrapeFrom: ScrapeSource
) => {
  switch (scrapeFrom) {
    case "perma":
      return scrapePermaPeople(scientificName);
    case "pfaf":
      return scrapePFAF(scientificName);
  }
};

export const getScrapeUrl = (scientificName: string, source: ScrapeSource) => {
  const { url, spaceReplacement } = SCRAPE_SOURCE_INFO[source];
  return `${url}${scientificName.replace(/ /g, spaceReplacement)}`;
};

const PREFERRED_SOURCE: ScrapeSource = "perma";

export const combineScrapedData = (
  scrapedData: (WebsiteScrapedDataWithSource | null)[]
) =>
  scrapedData.reduce<WebsiteScrapedData | null>((prev, cur) => {
    if (cur) {
      const { source, scrapeSources, ...curPlantData } = cur;
      const combinedSources = prev?.scrapeSources
        ? prev.scrapeSources.concat(scrapeSources)
        : scrapeSources;

      if (!prev || source === PREFERRED_SOURCE) {
        return { ...prev, ...curPlantData, scrapeSources: combinedSources };
      } else {
        Object.entries(curPlantData).forEach(([key, data]) => {
          const typesafeKey = key as keyof WebsiteScrapedData;
          if (data !== null && !prev[typesafeKey]) {
            prev[typesafeKey] = data as never;
          }
        });
      }
      return { ...prev, scrapeSources: combinedSources };
    }

    return prev;
  }, null);
