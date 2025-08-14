import { scrapePFAF } from "../util/pfaf-scraper";
import { plantCharacterstics } from "./mongo-config";

export const lookupPlantByName = async (
  lowercaseName: string,
  overwriteExisting?: boolean
) => {
  const existingPlantData = await plantCharacterstics.findOne({
    scientific_name: lowercaseName,
  });

  if (existingPlantData && !overwriteExisting) {
    const { _id, ...plantData } = existingPlantData;
    return plantData;
  }

  const scrapedPlantData = await scrapePFAF(lowercaseName);
  if (scrapedPlantData) {
    await plantCharacterstics.updateOne(
      { _id: existingPlantData?._id },
      { $set: scrapedPlantData },
      {
        upsert: true,
      }
    );

    return scrapedPlantData;
  }

  return null;
};

const lookupPlantByCoordinates = () => {
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
};
