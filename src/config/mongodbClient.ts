import { MongoClient } from "mongodb";
import { GbifSearchRecord, PlantDataDocument } from "./types";

export type PlantSizeData = { amount: number; unit: "m" | "cm" | string };

const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);

const plantsDb = client.db("plants");
export const plantCollection =
  plantsDb.collection<PlantDataDocument>("plantData");

export const gbifSearchesCollection =
  plantsDb.collection<GbifSearchRecord>("gbifSearches");
