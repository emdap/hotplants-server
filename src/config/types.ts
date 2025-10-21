import { ObjectId } from "mongodb";
import { PlantData } from "../graphql/graphql";

export type GbifDataArrayKeys =
  | "occurrenceCoords"
  | "mediaUrls"
  | "occurrenceIds";

export type GbifDataArrays = Pick<PartialPlantData, GbifDataArrayKeys>;

export type PlantDataDocument = Omit<PlantData, "_id"> & {
  _id: ObjectId;
};

export type PartialPlantData = Omit<
  PlantDataDocument,
  "_id" | "addedTimestamp" | "updatedTimestamp"
>;

/**
 * @property totalOccurrencesScraped: The total (non-unique) occurrences found
 * @property endOfRecords: Direct property from GBIF response, whether there are more occurrences
 *   via this search
 */
export type OccurrenceScrapeResponse = {
  totalOccurrencesScraped: number;
  endOfRecords: boolean;
};
