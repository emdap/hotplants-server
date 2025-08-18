import { MongoClient } from "mongodb";

type PlantSizeData = { amount: number; unit: "m" | "cm" | string };

export type PlantData = {
  scientificName: string;
  commonName?: string | string[];
  bloomColor?: string;
  bloomTime?: string;
  isPerennial?: boolean;
  maturityTime?: string;
  habitat?: string;
  soilTypes?: string[];
  lightLevels?: string[];
  hardiness?: number;
  height?: PlantSizeData;
  spread?: PlantSizeData;
  uses?: string[];
  otherTraits?: Record<string, string>;

  // Data from Gbif
  occurrenceCoords?: number[][];
  mediaUrls?: string[];
};

const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);
export const plantCharacterstics = client
  .db("plants")
  .collection<PlantData>("plant_characteristics");
