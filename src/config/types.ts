import { ObjectId } from "mongodb";
import {
  GardenPlantData,
  PlantData,
  SearchRecord,
  UserGarden,
} from "../graphqlConfig/graphql";

export type SortInput<T = Record<string, unknown>> = {
  field: keyof T;
  value: number;
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

export type SearchRecordDocument = Omit<SearchRecord, "_id" | "taxonKeys"> & {
  _id: ObjectId;
  taxonKeys?: number[];
};

export type PlantSearchParams = Pick<
  SearchRecordDocument,
  | "locationName"
  | "locationSource"
  | "boundingPolyCoords"
  | "commonName"
  | "scientificName"
>;

export type GardenPlantDocument = Pick<
  GardenPlantData,
  "addedToGardenTimestamp" | "customThumbnailUrl"
> & { _id: ObjectId };

export type UserGardenDocument = Omit<UserGarden, "plants"> & {
  plantRefs: GardenPlantDocument[];
};
