import { MongoClient } from "mongodb";

type PlantSizeData = { amount: number; unit: "m" | "cm" | string };

export type PlantData = {
  scientific_name: string;
  common_name?: string | string[];
  bloom_color?: string;
  bloom_time?: string;
  is_perennial?: boolean;
  maturity_time?: string;
  habitat?: string;
  soil_type?: string[];
  light_level?: string[];
  hardiness?: number;
  height?: PlantSizeData;
  spread?: PlantSizeData;
  uses?: string[];
  other_traits?: Record<string, string>;
};

const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);
export const plantCharacterstics = client
  .db("plants")
  .collection<PlantData>("plant_characteristics");
