import { ObjectId } from "mongodb";
import {
  GardenPlantRef,
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

type ArrayField<T> = {
  [K in keyof T]: NonNullable<T[K]> extends Array<any> ? K : never;
}[keyof T];
export type PlantFilterableArrayField = NonNullable<
  ArrayField<
    Omit<
      PlantDataDocument,
      "occurrences" | "commonNames" | "uses" | "scrapeSources"
    >
  >
>;
export type PlantArrayValuesDocument = {
  [K in PlantFilterableArrayField]?: PlantDataDocument[K];
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

export type GardenPlantRefDocument = Omit<GardenPlantRef, "_id"> & {
  _id: ObjectId;
};

export type UserGardenDocument = Omit<UserGarden, "plants" | "_id"> & {
  _id: ObjectId;
  plantRefs: GardenPlantRefDocument[];
};
