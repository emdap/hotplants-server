import { ObjectId } from "mongodb";
import { PlantData, PlantDataInput } from "../graphql/graphql";
import { GbifOccurrenceSearchParams } from "./gbifClient";

export type PlantDataDocument = Omit<
  PlantData,
  "_id" | "fullOccurrencesCount"
> & {
  _id: ObjectId;
};

export type PartialPlantData = Omit<
  PlantDataDocument,
  "_id" | "addedTimestamp" | "updatedTimestamp"
>;

export type PlantSearchParams = Omit<
  GbifOccurrenceSearchParams,
  "geometry" | "scientificName"
> &
  // TODO: Strange error, if given PlantDataInput as-is, TSOA has error
  // "GenerateMetadataError: Cannot read properties of undefined (reading 'kind')""
  Omit<PlantDataInput, "">;

export type SearchRecordStatus = "READY" | "SCRAPING" | "COMPLETE";

export type SearchRecordDocument = {
  _id: ObjectId;
  jsonStringSearch: string;
  originalSearch: PlantSearchParams;
  status: SearchRecordStatus;
  statusUpdated: number;
  occurrencesOffset: number;
};

/**
 * @property totalOccurrencesScraped: The total (non-unique) occurrences found
 * @property endOfRecords: Direct property from GBIF response, whether there are more occurrences
 *   via this search
 */
export type OccurrenceScrapeResponse = {
  totalOccurrencesScraped: number;
  endOfRecords: boolean;
};
