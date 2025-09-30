import { ObjectId } from "mongodb";
import { PlantData } from "../graphql/graphql";

export type GbifDataArrayKeys =
  | "occurrenceCoords"
  | "mediaUrls"
  | "occurrenceIds";

export type GbifDataArrays = Pick<PartialPlantData, GbifDataArrayKeys>;

export type PlantDataDocument = PlantData & {
  _id?: ObjectId;
  otherTraits?: Record<string, string>;
};

export type PartialPlantData = Omit<
  PlantDataDocument,
  "addedTimestamp" | "updatedTimestamp"
>;

/**
 * @property count: Count of results, which is new/unique occurrences found
 * @property results: The unique occurrences found (omits mongodb timestamp information)
 * @property totalOccurrencesScraped: The total (non-unique) occurrences found
 * @property endOfRecords: Direct property from GBIF response, whether there are more occurrences
 *   via this search
 */
export type OccurrenceScrapeResponse = {
  count: number;
  results: PartialPlantData[];

  totalOccurrencesScraped: number;
  endOfRecords: boolean;
};
