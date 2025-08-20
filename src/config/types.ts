import { ObjectId } from "mongodb";
import { PlantSizeData } from "./mongodbClient";

export type PlantData = {
  _id?: ObjectId;

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

  scrapeSuccessful: boolean;
};

export type PlantResponse = Omit<PlantData, "scrapeSuccessful">;
