import { Body, Post, Route } from "tsoa";
import { GbifOccurrenceSearchParams } from "../config/gbifClient";
import { PlantResponse } from "../config/types";
import { getCompletedGbifPlants, searchGbifPlants } from "./gbifPlantSearch";

@Route("plants")
export class PlantController {
  @Post("search")
  public async searchPlants(
    @Body() searchParams: GbifOccurrenceSearchParams | undefined = {}
  ): Promise<PlantResponse[] | void> {
    const gbifData = await searchGbifPlants(searchParams);
    return gbifData && getCompletedGbifPlants(gbifData);
  }
}
