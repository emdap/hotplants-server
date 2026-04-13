import { ObjectId } from "mongodb";
import {
  EntityType,
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

// Redefining these because graphql generated type using Maybe wrapper makes it too difficult to extract
// the non-null form of these properties
export type PlantSearchLocationParams = {
  locationName: string;
  locationSource: "search" | "custom";
  boundingPolyCoords: number[][][];
};

export type EntityNameParams =
  | { commonName: string }
  | { scientificName: string };

export type EntitySearchParams = {
  location?: PlantSearchLocationParams;
  entityName?: EntityNameParams;
  entityType: EntityType;
};

export type SearchRecordDocument = Omit<
  SearchRecord,
  "_id" | "userIds" | "taxonKeys"
> & {
  _id: ObjectId;
  userIds?: ObjectId[];
  taxonKeys?: number[];
};

export type GardenPlantRefDocument = Omit<GardenPlantRef, "_id"> & {
  _id: ObjectId;
};

export type UserGardenDocument = Omit<UserGarden, "plants" | "_id"> & {
  _id: ObjectId;
  plantRefs: GardenPlantRefDocument[];
};
