import { MongoClient, OptionalId } from "mongodb";
import { PlantDataDocument, SearchRecordDocument } from "./types";

export type PlantSizeData = { amount: number; unit: "m" | "cm" | string };

const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);

const plantsDb = client.db("plants");
export const plantCollection =
  plantsDb.collection<OptionalId<PlantDataDocument>>("plantData");

export const gbifSearchesCollection =
  plantsDb.collection<OptionalId<SearchRecordDocument>>("gbifSearches");
