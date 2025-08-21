import { bboxPolygon } from "@turf/turf";
import { BBox } from "geojson";
import { Body, Post, Route } from "tsoa";
import { stringify } from "wkt";
import { GbifOccurrenceSearchParams } from "../config/gbifClient";
import { OccurrenceScrapeResponse, PlantDataRaw } from "../config/types";
import { getCompletedGbifPlants, searchGbifPlants } from "./gbifPlantSearch";

export type PlantSearchParams = Omit<GbifOccurrenceSearchParams, "geometry"> & {
  boundingBox?: number[];
};

const MIN_PAGE_SIZE = 5;

const DEFAULT_GBIF_SEARCH_PARAMS: GbifOccurrenceSearchParams = {
  kingdomKey: [6],
  basisOfRecord: ["HUMAN_OBSERVATION", "OBSERVATION", "MACHINE_OBSERVATION"],
  limit: 100,

  // @ts-expect-error API spec is incorrect
  mediaType: "StillImage",
};

@Route("plants")
export class PlantController {
  @Post("scrapeOccurrences")
  public async scrapeOccurrences(
    @Body() body: PlantSearchParams | undefined = {}
  ): Promise<OccurrenceScrapeResponse | void> {
    const { boundingBox, ...searchParams } = body;
    const bboxPoly = boundingBox && bboxPolygon(boundingBox as BBox);

    let results: PlantDataRaw[] = [];

    // bboxPoly && results.push(...(await lookupPlantByCoordinates(bboxPoly)));

    if (!results || results.length <= (body.limit || MIN_PAGE_SIZE)) {
      const gbifData = await searchGbifPlants({
        ...DEFAULT_GBIF_SEARCH_PARAMS,
        ...(bboxPoly && { geometry: [stringify(bboxPoly)] }),
        ...searchParams,
      });

      gbifData && results.push(...(await getCompletedGbifPlants(gbifData)));
    }

    return (
      results && {
        count: results.length,
        occurrencesFound: results.reduce<number>(
          (prev, plant) => (prev += plant.occurrenceIds?.length ?? 0),
          0
        ),
        results,
      }
    );
  }
}
