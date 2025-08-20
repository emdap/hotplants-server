import { plantCollection } from "../../config/mongodbClient";
import { PlantData } from "../../config/types";
import { scrapePFAF } from "../pfafScraper";

export const lookupPlantByName = async (
  scientificName: string
): Promise<PlantData> => {
  const lowercaseName = scientificName.toLowerCase();
  const existingPlant = await plantCollection.findOne({
    scientificName: lowercaseName,
  });

  return existingPlant ?? scrapePFAF(lowercaseName);
};

export const storePlantData = async (plantData: PlantData) => {
  const { _id, ...rest } = plantData;

  if (_id) {
    return plantCollection.updateOne({ _id }, { $set: rest });
  } else {
    return plantCollection.insertOne(rest);
  }
};

// const lookupPlantByCoordinates = () => {
//TODO
// const box = bboxPolygon([45, 46, -123, -122]);
// get matching plants from existing data using user's in-depth filters
// scrape additional plants from gbif based on location data or text search
// get more data for the gbif plants from pfif
// apply more in-depth filters to the looked-up plants
// return full results
// Field of coordinates can be an array[][], mongodb will filter array entries using this
// {
// ADD FIELD NAME - DEMO WITH 'COORDINATES'
//   coordinates: {
//     $geoIntersects: {
//        $geometry: {
//           type: "Polygon" ,
//           coordinates: [
//            [
//              [-122.8367489,45.432536 ],
//              [-122.4720252,45.432536 ],
//              [-122.4720252,45.6528812 ],
//              [-122.8367489,45.6528812 ],
//              [-122.8367489,45.432536]
//            ]
//           ]
//        }
//     }
//   }
// }
// };
