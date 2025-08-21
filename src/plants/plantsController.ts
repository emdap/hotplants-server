import { bboxPolygon } from "@turf/turf";
import { BBox } from "geojson";
import { Body, Post, Route } from "tsoa";
import { stringify } from "wkt";
import { GbifOccurrenceSearchParams } from "../config/gbifClient";
import { PlantDataRaw, PlantSearchResponse } from "../config/types";
import { getCompletedGbifPlants, searchGbifPlants } from "./gbifPlantSearch";

export type PlantSearchParams = Omit<GbifOccurrenceSearchParams, "geometry"> & {
  boundingBox?: number[];
};

const MIN_PAGE_SIZE = 5;

const DEFAULT_GBIF_SEARCH_PARAMS: GbifOccurrenceSearchParams = {
  kingdomKey: [6],
  basisOfRecord: ["HUMAN_OBSERVATION", "OBSERVATION", "MACHINE_OBSERVATION"],
  limit: MIN_PAGE_SIZE,

  // @ts-expect-error API spec is incorrect
  mediaType: "StillImage",
};

@Route("plants")
export class PlantController {
  @Post("search")
  public async searchPlants(
    @Body() body: PlantSearchParams | undefined = DEFAULT_GBIF_SEARCH_PARAMS
  ): Promise<PlantSearchResponse | void> {
    const { boundingBox, ...searchParams } = body;
    const bboxPoly = boundingBox && bboxPolygon(boundingBox as BBox);

    let results: PlantDataRaw[] = [];

    // bboxPoly && results.push(...(await lookupPlantByCoordinates(bboxPoly)));

    if (!results || results.length <= (body.limit || MIN_PAGE_SIZE)) {
      const gbifData = await searchGbifPlants({
        ...(bboxPoly && { geometry: [stringify(bboxPoly)] }),
        ...searchParams,
      });

      gbifData && results.push(...(await getCompletedGbifPlants(gbifData)));
    }

    return (
      results && {
        count: results.length,
        plantNames: results.map(({ scientificName }) => scientificName),
        results: results?.map(({ scrapeSuccessful, ...plant }) => plant),
      }
    );
  }
}
