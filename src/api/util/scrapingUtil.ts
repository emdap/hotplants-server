import { EntityType } from "@/graphqlConfig/graphql";
import { Entries } from "type-fest";
import { stringify } from "wkt";
import { PartialPlantData, SearchRecordDocument } from "../../config/types";
import { parseBboxInput } from "../../graphqlConfig/resolvers/entityResolvers";
import { scrapePermaPeople } from "../permaPeopleScraper";
import { scrapePFAF } from "../pfafScraper";

const MAX_STALE_SEARCH_MILLISECONDS = 300000; // 5 minutes

type WebsiteScrapedData = Omit<
  PartialPlantData,
  "scientificName" | "occurrences"
>;

export type WebsiteScrapedDataWithSource = WebsiteScrapedData & {
  source: ScrapeSource;
};

type ScrapeSource = "pfaf" | "perma";

const SCRAPE_SOURCE_INFO: Record<
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

/** Convert the coordinates to a polygon. Will error out if format is incorrect. */
export const convertPolygon = (boundingPolyCoords?: number[][][] | null) => {
  const validPoly = boundingPolyCoords && parseBboxInput(boundingPolyCoords);
  return validPoly ? ([stringify(validPoly)] as string[]) : undefined;
};

const getScrapeUrls = (
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

const scrapePlantData = async (source: ScrapeSource, scrapeUrl: string) => {
  switch (source) {
    case "perma":
      return scrapePermaPeople(scrapeUrl);
    case "pfaf":
      return scrapePFAF(scrapeUrl);
  }
};

const PREFERRED_SOURCE: ScrapeSource = "perma";

const combineScrapedData = (
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
