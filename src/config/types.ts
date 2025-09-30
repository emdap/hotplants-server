import { ObjectId } from "mongodb";
import { PlantData } from "../graphql/graphql";
import { GbifPaginationInfo } from "../plants/util/mongodbUtil";

type CommonPlantDataKeys = "occurrenceCoords" | "mediaUrls" | "occurrenceIds";

export type PlantDataDocument = Omit<PlantData, CommonPlantDataKeys> & {
  _id?: ObjectId;

  otherTraits?: Record<string, string>;
  occurrenceCoords?: number[][];
  mediaUrls?: string[];

  scrapeSources?: string[];
  occurrenceIds?: number[];
};

export type OccurrenceScrapeResponse = {
  count: number;
  results: Omit<PlantDataDocument, "_id">[];
  paginationInfo: GbifPaginationInfo;
};

export type SearchRecordStatus = "SCRAPING" | "DONE";

export type SearchRecord = {
  jsonStringSearch: string;
  pageSize: number;
  lastPageSearched: number;
  hasNextPage: boolean;
  uniqueOccurrences: number;

  status: SearchRecordStatus;
};

export type CommonPlantData = Pick<PlantDataDocument, CommonPlantDataKeys>;
