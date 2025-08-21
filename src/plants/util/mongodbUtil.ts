import { Feature, Polygon } from "geojson";
import { plantCollection } from "../../config/mongodbClient";
import { PlantDataRaw } from "../../config/types";
import { scrapePFAF } from "../pfafScraper";

export const lookupPlantByName = async (
  scientificName: string
): Promise<PlantDataRaw> => {
  const lowercaseName = scientificName.toLowerCase();
  const existingPlant = await plantCollection.findOne({
    scientificName: lowercaseName,
  });

  return existingPlant ?? scrapePFAF(lowercaseName);
};

export const storePlantData = async (plantData: PlantDataRaw) => {
  const { _id, ...rest } = plantData;

  if (_id) {
    console.log("update", plantData.scientificName);
    return plantCollection.updateOne({ _id }, { $set: rest });
  } else {
    console.log("insert", plantData.scientificName);
    return plantCollection.insertOne(rest);
  }
};

export const lookupPlantByCoordinates = async ({
  geometry,
}: Feature<Polygon>) =>
  plantCollection
    .find({
      occurrenceCoords: { $geoIntersects: { $geometry: geometry } },
    })
    .toArray();
