import { ObjectId, WithId } from "mongodb";
import { Body, Post, Res, Route, TsoaResponse } from "tsoa";
import { stringify } from "wkt";
import { gbifClient, GbifOccurrenceSearchParams } from "../config/gbifClient";
import { OccurrenceScrapeResponse } from "../config/types";
import { SearchRecord, SearchRecordStatus } from "../graphql/graphql";
import { parseBboxInput } from "../graphql/queryResolvers";
import {
  getCompletedGbifPlants,
  reduceGbifResults,
  searchGbifSpecies,
} from "./util/gbifUtil";
import {
  closeGbifSearchRecord,
  createGbifSearchRecord,
  openGbifSearchRecord,
  PlantSearchParams,
} from "./util/mongodbUtil";

const EMPTY_OCCURRENCE_SCRAPE_RESPONSE: OccurrenceScrapeResponse = {
  count: 0,
  results: [],
  totalOccurrencesScraped: 0,
  endOfRecords: true,
};

const DEFAULT_GBIF_SEARCH_PARAMS: PlantSearchParams = {
  kingdomKey: [6],
  basisOfRecord: ["HUMAN_OBSERVATION", "OBSERVATION", "MACHINE_OBSERVATION"],

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
    @Body() plantSearch: PlantSearchParams | undefined = {},
    @Res() errorResponse: TsoaResponse<500, string>
  ): Promise<ObjectId | undefined> {
    const [gbifQuery, searchRecord] = await Promise.all([
      createGbifQuery(plantSearch),
      findOrCreateSearchRecord(plantSearch),
    ]);

    if (!searchRecord) {
      return errorResponse(500, "Unable to create search record");
    } else if (searchRecord.status !== SearchRecordStatus.Scraping) {
      runPlantSearch(gbifQuery, searchRecord);
    }

    return searchRecord._id;
  }

  @Post("scrapeOccurrencesLegacy")
  public async scrapeOccurrencesLegacy(
    @Body() body: PlantSearchParams | undefined = {},
    @Res() errorResponse: TsoaResponse<500, string>
  ): Promise<OccurrenceScrapeResponse | void> {
    const baseQuery = await createGbifQuery(body);

    const searchRecord =
      (await openGbifSearchRecord(body)) ??
      (await createGbifSearchRecord(body));

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

const findOrCreateSearchRecord = async (searchParams: PlantSearchParams) => {
  const existingRecord = await openGbifSearchRecord(searchParams);
  return existingRecord ?? createGbifSearchRecord(searchParams);
};

const runPlantSearch = async (
  gbifQuery: GbifOccurrenceSearchParams,
  searchRecord: WithId<SearchRecord>
) => {
  try {
    const results = await searchGbifOccurrences(
      gbifQuery,
      searchRecord.totalOccurrences
    );
    return closeGbifSearchRecord(searchRecord, results);
  } catch (error) {
    console.error(error);
    return closeGbifSearchRecord(
      searchRecord,
      EMPTY_OCCURRENCE_SCRAPE_RESPONSE
    );
  }
};

const createGbifQuery = async (
  body: PlantSearchParams | undefined = {}
): Promise<GbifOccurrenceSearchParams> => {
  const { boundingBox, commonName, scientificName, ...searchParams } = {
    ...body,
    ...DEFAULT_GBIF_SEARCH_PARAMS,
  };

  const bboxPoly = boundingBox && parseBboxInput(boundingBox);
  const geometry = bboxPoly ? ([stringify(bboxPoly)] as string[]) : undefined;

  const taxonKey = commonName ? await searchGbifSpecies(commonName) : undefined;

  return {
    geometry,
    taxonKey,
    scientificName: scientificName ? [scientificName] : undefined,
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
