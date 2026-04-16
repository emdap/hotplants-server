import { EntityType } from "@/graphqlConfig/graphql";
import { Entries } from "type-fest";
import { stringify } from "wkt";
import {
  gbifClient,
  GbifOccurrenceSearchParams,
} from "../../config/gbifClient";
import {
  EntitySearchParams,
  PartialPlantData,
  SearchRecordDocument,
} from "../../config/types";
import { parseBboxInput } from "../../graphqlConfig/resolvers/entityResolvers";
import { scrapePermaPeople } from "../permaPeopleScraper";
import { scrapePFAF } from "../pfafScraper";
import { ENTITY_TO_KINGDOM, processGbifResults } from "./gbifUtil";
import { finishRunningSearch, updateSearchRecord } from "./mongodbUtil";

const DEFAULT_GBIF_SEARCH_PARAMS: Omit<
  GbifOccurrenceSearchParams,
  keyof EntitySearchParams
> = {
  basisOfRecord: ["HUMAN_OBSERVATION", "OBSERVATION", "MACHINE_OBSERVATION"],
  limit: 300,
  // @ts-expect-error API spec is incorrect
  mediaType: "StillImage",
};

const MAX_STALE_SEARCH_MILLISECONDS = 300000; // 5 minutes

export type WebsiteScrapedData = Omit<
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
  userIds: _userIds,
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
    kingdomKey: [ENTITY_TO_KINGDOM[searchRecord.entityType]],

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
        processGbifResults(
          data.results,
          searchRecord.entityType,
          searchRecord.commonName,
        ),
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

export const getScrapeUrls = (
  scientificName: string,
  previousScrapeSources?: string[],
) =>
  (
    Object.entries(SCRAPE_SOURCE_INFO) as Entries<typeof SCRAPE_SOURCE_INFO>
  ).flatMap(([source, { url, spaceReplacement }]) => {
    const fullUrl = `${url}${scientificName.replace(/ /g, spaceReplacement)}`;

    if (previousScrapeSources?.includes(fullUrl)) {
      return [];
    }

    return { source, fullUrl };
  });

export const scrapePlantData = async (
  source: ScrapeSource,
  scrapeUrl: string,
) => {
  switch (source) {
    case "perma":
      return scrapePermaPeople(scrapeUrl);
    case "pfaf":
      return scrapePFAF(scrapeUrl);
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

export const getScrapedData = async (
  scientificName: string,
  entityType: EntityType,
  scrapeSources?: string[],
) => {
  if (entityType === "plant") {
    const scrapeUrls = getScrapeUrls(scientificName, scrapeSources);

    const resolvedScrapes = await Promise.all(
      scrapeUrls.map(({ source, fullUrl }) => scrapePlantData(source, fullUrl)),
    );

    return combineScrapedData(resolvedScrapes);
  }

  return null;
};
