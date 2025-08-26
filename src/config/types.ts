import { ObjectId } from "mongodb";
import { PlantData } from "../graphql/types";

export type PlantDataDocument = PlantData & {
  _id?: ObjectId;

  otherTraits?: Record<string, string>;

  // Data from Gbif
  occurrenceCoords?: number[][];
  mediaUrls?: string[];
  occurrenceIds?: number[];

  scrapeSources?: string[];
};

export type OccurrenceScrapeResponse = {
  count: number;
  occurrencesFound: number;
  results: Omit<PlantDataDocument, "_id">[];
};

export type GbifSearchRecord = {
  jsonStringSearch: string;
  pageSize: number;
  lastPageSearched: number;
  hasNextPage: boolean;
};
