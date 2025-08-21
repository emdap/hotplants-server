import { bboxPolygon } from "@turf/turf";
import { BBox } from "geojson";
import { Body, Post, Route } from "tsoa";
import { stringify } from "wkt";
import { GbifOccurrenceSearchParams } from "../config/gbifClient";
import { OccurrenceScrapeResponse } from "../config/types";
import { getCompletedGbifPlants, searchGbifPlants } from "./gbifPlantSearch";

export type PlantSearchParams = Omit<
  GbifOccurrenceSearchParams,
  "geometry" | "limit"
> & {
  boundingBox?: number[];
};

// const MIN_PAGE_SIZE = 5;

const EMPTY_OCCURRENCE_SCRAPE_RESPONSE: OccurrenceScrapeResponse = {
  count: 0,
  occurrencesFound: 0,
  results: [],
};

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
    const { boundingBox, ...searchParams } = {
      ...DEFAULT_GBIF_SEARCH_PARAMS,
      ...body,
    };

    const bboxPoly = boundingBox && bboxPolygon(boundingBox as BBox);

    // bboxPoly && results.push(...(await lookupPlantByCoordinates(bboxPoly)));

    const gbifData = await searchGbifPlants({
      ...(bboxPoly && { geometry: [stringify(bboxPoly)] }),
      ...searchParams,
    });

    if (!gbifData) {
      return EMPTY_OCCURRENCE_SCRAPE_RESPONSE;
    }

    const occurrencesFound = Object.values(gbifData).reduce<number>(
      (prev, plant) => (prev += plant.occurrenceIds?.length ?? 0),
      0
    );
    const results = await getCompletedGbifPlants(gbifData);

    return {
      count: results.length,
      occurrencesFound,
      results,
    };
  }
}
