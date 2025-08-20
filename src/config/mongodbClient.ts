import { MongoClient } from "mongodb";
import { PlantData } from "./types";

export type PlantSizeData = { amount: number; unit: "m" | "cm" | string };

const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);
export const plantCollection = client
  .db("plants")
  .collection<PlantData>("plantData");
