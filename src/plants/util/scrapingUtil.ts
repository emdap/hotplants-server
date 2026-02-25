import { stringify } from "wkt";
import {
  gbifClient,
  GbifOccurrenceSearchParams,
} from "../../config/gbifClient";
import {
  PartialPlantData,
  PlantSearchParams,
  SearchRecordDocument,
} from "../../config/types";
import { parseBboxInput } from "../../graphqlConfig/resolvers/plantResolvers";
import { scrapePermaPeople } from "../permaPeopleScraper";
import { scrapePFAF } from "../pfafScraper";
import { processGbifResults } from "./gbifUtil";
import { finishRunningSearch, updateSearchRecord } from "./mongodbUtil";

const DEFAULT_GBIF_SEARCH_PARAMS: Omit<
  GbifOccurrenceSearchParams,
  keyof PlantSearchParams
> = {
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

export type SearchRecordSummary = { id: string } & Omit<
  SearchRecordDocument,
  "_id"
>;

export const normalizeSearchRecord = ({
  _id,
  ...searchRecord
}: SearchRecordDocument): SearchRecordSummary => ({
  id: _id.toString(),
  ...searchRecord,
});

export const shouldStartScraping = ({
  status,
  lastRanTimestamp,
}: SearchRecordDocument) => {
  switch (status) {
    case "READY":
      return true;
    case "SCRAPING":
      if (!lastRanTimestamp) {
        return true;
      }

      const now = Date.now();
      const timeDifference = now - lastRanTimestamp;
      console.log(timeDifference);
      return timeDifference >= MAX_STALE_SEARCH_MILLISECONDS;
    default:
      return false;
  }
};

export const searchGbifOccurrences = async (
  searchRecord: SearchRecordDocument,
) => {
  const geometry = convertPolygon(searchRecord.boundingPolyCoords);
  const gbifQueryParams = {
    geometry,
    taxonKey: searchRecord.taxonKeys,
    scientificName: searchRecord.scientificName
      ? [searchRecord.scientificName]
      : undefined,
    offset: searchRecord.occurrencesOffset,
    ...DEFAULT_GBIF_SEARCH_PARAMS,
  };

  console.info("running search with query params:\n", gbifQueryParams);

  try {
    const { data } = await gbifClient.GET("/occurrence/search", {
      params: {
        query: gbifQueryParams,
      },
    });

    if (data?.results) {
      await Promise.all([
        updateSearchRecord(searchRecord._id, { totalOccurrences: data?.count }),
        processGbifResults(data.results),
      ]);

      finishRunningSearch(
        searchRecord,
        {
          occurrencesProcessed: data.results?.length ?? 0,
          endOfRecords:
            data.endOfRecords === undefined ? true : data.endOfRecords,
        },
        true,
      );

      return;
    }
  } catch (error) {
    console.error(error);
  }

  finishRunningSearch(searchRecord, null, true);
};

/** Convert the coordinates to a polygon. Will error out if format is incorrect. */
export const convertPolygon = (boundingPolyCoords?: number[][][] | null) => {
  const validPoly = boundingPolyCoords && parseBboxInput(boundingPolyCoords);
  return validPoly ? ([stringify(validPoly)] as string[]) : undefined;
};

export const createGbifQuery = async ({
  scientificName,
  taxonKeys,
  boundingPolyCoords,
}: SearchRecordDocument): Promise<GbifOccurrenceSearchParams> => {
  const geometry = convertPolygon(boundingPolyCoords);

  return {
    geometry,
    taxonKey: taxonKeys,
    scientificName: scientificName ? [scientificName] : undefined,
    ...DEFAULT_GBIF_SEARCH_PARAMS,
  };
};

export const iteratePlantScrapers = (
  scientificName: string,
  previousScrapeSources?: string[],
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
  scrapeFrom: ScrapeSource,
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
  scrapedData: (WebsiteScrapedDataWithSource | null)[],
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
