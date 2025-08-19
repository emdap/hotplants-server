import { Body, Post, Route } from "tsoa";
import { GbifOccurrenceSearchQuery } from "../config/gbifClient";
import { PlantData } from "../config/mongodbClient";
import { searchGbifPlants, storeCompletedGbifPlants } from "./gbifPlantSearch";

@Route("plants")
export class PlantController {
  @Post("search")
  public async searchPlants(
    @Body() query?: GbifOccurrenceSearchQuery
  ): Promise<PlantData[] | void> {
    const gbifData = await searchGbifPlants(query);
    return gbifData && storeCompletedGbifPlants(gbifData);
  }
}
