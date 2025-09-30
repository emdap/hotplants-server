import { bboxPolygon } from "@turf/turf";
import { BBox } from "geojson";
import { Body, Post, Route } from "tsoa";
import { stringify } from "wkt";
import { gbifClient, GbifOccurrenceSearchParams } from "../config/gbifClient";
import { OccurrenceScrapeResponse } from "../config/types";
import {
  getCompletedGbifPlants,
  reduceGbifResults,
  searchGbifSpecies,
} from "./util/gbifUtil";
import {
  getGbifSearchRecord,
  updateGbifSearchRecord,
} from "./util/mongodbUtil";

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
    const {
      boundingBox,
      q: searchText,
      ...searchParams
    } = {
      ...body,
      ...DEFAULT_GBIF_SEARCH_PARAMS,
    };

    const bboxPoly = boundingBox && bboxPolygon(boundingBox as BBox);

    // bboxPoly && results.push(...(await lookupPlantByCoordinates(bboxPoly)));

    const taxonKey = searchText
      ? await searchGbifSpecies(searchText)
      : undefined;

    const geometry = bboxPoly && [stringify(bboxPoly)];

    const baseQuery = {
      geometry,
      taxonKey,
      ...searchParams,
    };

    let searchRecord = await getGbifSearchRecord(baseQuery);

    console.log(searchRecord);

    const { data } = await gbifClient.GET("/occurrence/search", {
      params: {
        query: {
          ...baseQuery,

          // Always requesting a limit of 100, but doubly enforcing previous limit here so that
          // the offset definitely matches up
          ...(searchRecord && {
            limit: searchRecord.pageSize,
            offset: searchRecord.pageSize * (searchRecord.lastPageSearched + 1),
          }),
        },
      },
    });

    if (!data?.results) {
      return EMPTY_OCCURRENCE_SCRAPE_RESPONSE;
    }

    const reducedResults = reduceGbifResults(data.results);

    const occurrencesFound = Object.values(reducedResults).reduce<number>(
      (prev, plant) => (prev += plant.occurrenceIds?.length ?? 0),
      0
    );
    const uniqueResults = await getCompletedGbifPlants(
      reducedResults,
      !searchRecord || searchRecord?.lastPageSearched == 0
    );

    await updateGbifSearchRecord(
      searchRecord,
      baseQuery,
      data,
      uniqueResults.length
    );

    return {
      occurrencesFound,
      count: uniqueResults.length,
      results: uniqueResults,
    };
  }
}
