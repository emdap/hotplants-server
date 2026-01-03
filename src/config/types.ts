import { ObjectId } from "mongodb";
import {
  GardenPlantData,
  PlantData,
  PlantDataInput,
  SearchRecord,
  UserGarden,
} from "../graphqlConfig/graphql";
import { GbifOccurrenceSearchParams } from "./gbifClient";

export type SortInput<T = Record<string, unknown>> = {
  field: keyof T;
  direction: number;
};

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

export type GardenPlantDocument = Pick<
  GardenPlantData,
  "addedToGardenTimestamp" | "customThumbnailUrl"
> & { _id: ObjectId };

export type UserGardenDocument = Omit<UserGarden, "plants"> & {
  plantRefs: GardenPlantDocument[];
};

export type SearchRecordDocument = Omit<SearchRecord, "_id"> & {
  _id: ObjectId;
  originalSearch: PlantSearchParams;
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
