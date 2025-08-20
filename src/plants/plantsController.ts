import { Body, Post, Route } from "tsoa";
import { GbifOccurrenceSearchQuery } from "../config/gbifClient";
import { PlantResponse } from "../config/types";
import { getCompletedGbifPlants, searchGbifPlants } from "./gbifPlantSearch";

@Route("plants")
export class PlantController {
  @Post("search")
  public async searchPlants(
    @Body() query?: GbifOccurrenceSearchQuery
  ): Promise<PlantResponse[] | void> {
    const gbifData = await searchGbifPlants(query);
    return gbifData && getCompletedGbifPlants(gbifData);
  }
}
