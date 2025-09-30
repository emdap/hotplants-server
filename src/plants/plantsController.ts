import { bboxPolygon } from "@turf/turf";
import { BBox } from "geojson";
import { ObjectId } from "mongodb";
import { Body, Post, Res, Route, TsoaResponse } from "tsoa";
import { stringify } from "wkt";
import { gbifClient, GbifOccurrenceSearchParams } from "../config/gbifClient";
import { OccurrenceScrapeResponse } from "../config/types";
import {
  getCompletedGbifPlants,
  reduceGbifResults,
  searchGbifSpecies,
} from "./util/gbifUtil";
import {
  closeGbifSearchRecord,
  createGbifSearchRecord,
  openGbifSearchRecord,
} from "./util/mongodbUtil";

export type PlantSearchParams = Omit<
  GbifOccurrenceSearchParams,
  "geometry" | "limit"
> & {
  boundingBox?: number[];
};

// const MIN_PAGE_SIZE = 5;
const DEFAULT_LIMIT = 100;

const EMPTY_OCCURRENCE_SCRAPE_RESPONSE: OccurrenceScrapeResponse = {
  count: 0,
  results: [],
  totalOccurrencesScraped: 0,
  endOfRecords: true,
};

const DEFAULT_GBIF_SEARCH_PARAMS: GbifOccurrenceSearchParams = {
  kingdomKey: [6],
  basisOfRecord: ["HUMAN_OBSERVATION", "OBSERVATION", "MACHINE_OBSERVATION"],
  limit: DEFAULT_LIMIT,

  // @ts-expect-error API spec is incorrect
  mediaType: "StillImage",
};

@Route("plants")
export class PlantController {
  /**
   * Initiate a new scrape of occurrences from GBIF and combine with PFAF data.
   * Return the searchRecord, which can be queried against in graphQL to check
   * the status of the scrape.
   */
  @Post("scrapeOccurrences")
  public async scrapeOccurrences(
    @Body() body: PlantSearchParams | undefined = {},
    @Res() errorResponse: TsoaResponse<500, string>
  ): Promise<ObjectId | undefined> {
    const baseQuery = await createBaseQuery(body);

    const searchRecord =
      (await openGbifSearchRecord(baseQuery)) ??
      (await createGbifSearchRecord(baseQuery));

    console.info(searchRecord);

    if (!searchRecord) {
      return errorResponse(500, "Unable to create search record");
    }

    const scrapeAdditionalData = async () => {
      try {
        const results = await searchGbifOccurrences(
          baseQuery,
          searchRecord.totalOccurrences
        );
        searchRecord && (await closeGbifSearchRecord(searchRecord, results));
        console.info(results);
      } catch (error) {
        console.error(error);
        searchRecord &&
          (await closeGbifSearchRecord(
            searchRecord,
            EMPTY_OCCURRENCE_SCRAPE_RESPONSE
          ));
      }
    };

    searchRecord._id && scrapeAdditionalData();
    return searchRecord._id;
  }

  @Post("scrapeOccurrencesLegacy")
  public async scrapeOccurrencesLegacy(
    @Body() body: PlantSearchParams | undefined = {},
    @Res() errorResponse: TsoaResponse<500, string>
  ): Promise<OccurrenceScrapeResponse | void> {
    const baseQuery = await createBaseQuery(body);

    const searchRecord =
      (await openGbifSearchRecord(baseQuery)) ??
      (await createGbifSearchRecord(baseQuery));

    if (!searchRecord) {
      return errorResponse(500, "Unable to create search record");
    }

    const results = await searchGbifOccurrences(
      baseQuery,
      searchRecord.totalOccurrences
    );

    await closeGbifSearchRecord(searchRecord, results);

    return results;
  }
}

const createBaseQuery = async (body: PlantSearchParams | undefined = {}) => {
  const {
    boundingBox,
    q: searchText,
    ...searchParams
  } = {
    ...body,
    ...DEFAULT_GBIF_SEARCH_PARAMS,
  };

  const bboxPoly = boundingBox && bboxPolygon(boundingBox as BBox);

  const taxonKey = searchText ? await searchGbifSpecies(searchText) : undefined;

  const geometry = bboxPoly && [stringify(bboxPoly)];

  return {
    geometry,
    taxonKey,
    ...searchParams,
  };
};

const searchGbifOccurrences = async (
  baseQuery: GbifOccurrenceSearchParams,
  previousSearchOffset: number
): Promise<OccurrenceScrapeResponse> => {
  const { data } = await gbifClient.GET("/occurrence/search", {
    params: {
      query: {
        ...baseQuery,
        offset: previousSearchOffset,
      },
    },
  });

  if (!data?.results?.length) {
    return EMPTY_OCCURRENCE_SCRAPE_RESPONSE;
  }

  const { results, endOfRecords } = data;
  const reducedResults = reduceGbifResults(results);

  const uniqueResults = await getCompletedGbifPlants(
    reducedResults,
    previousSearchOffset === 0
  );

  return {
    count: uniqueResults.length,
    results: uniqueResults,

    totalOccurrencesScraped: results.length,
    endOfRecords: Boolean(endOfRecords),
  };
};
