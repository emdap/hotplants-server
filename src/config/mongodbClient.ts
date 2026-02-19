import { MongoClient } from "mongodb";
import {
  PlantDataDocument,
  SearchRecordDocument,
  UserGardenDocument,
} from "./types";

export type PlantSizeData = { amount: number; unit: "m" | "cm" | string };

export const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);

const plantsDb = client.db("plants");
export const plantsCollection =
  plantsDb.collection<PlantDataDocument>("plantData");

export const userGardensCollection =
  plantsDb.collection<UserGardenDocument>("userGardens");

export const gbifSearchesCollection =
  plantsDb.collection<SearchRecordDocument>("gbifSearches");
