import { ObjectId } from "mongodb";
import { PlantData } from "../graphql/graphql";

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
  occurrencesFound: number;
  results: Omit<PlantDataDocument, "_id">[];
};

export type GbifSearchRecord = {
  jsonStringSearch: string;
  pageSize: number;
  lastPageSearched: number;
  hasNextPage: boolean;
};

export type CommonPlantData = Pick<PlantDataDocument, CommonPlantDataKeys>;
