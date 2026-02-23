import { ObjectId } from "mongodb";
import { Body, Get, Path, Post, Res, Route, TsoaResponse } from "tsoa";
import { gbifSearchesCollection } from "../config/mongodbClient";
import { PlantSearchParams } from "../config/types";
import {
  createSearchRecord,
  updateSearchRecord,
} from "../plants/util/mongodbUtil";
import {
  normalizeSearchRecord,
  searchGbifOccurrences,
  SearchRecordSummary,
  shouldStartScraping,
} from "../plants/util/scrapingUtil";

@Route("plants")
export class PlantController {
  @Post("getSearchRecord")
  public async getSearchRecord(
    @Body() plantSearch: PlantSearchParams,
    @Res() errorResponse: TsoaResponse<500, string>,
  ): Promise<SearchRecordSummary> {
    const existingSearchRecord =
      await gbifSearchesCollection.findOne(plantSearch);

    if (existingSearchRecord) {
      return normalizeSearchRecord(existingSearchRecord);
    }

    const newSearchRecord = await createSearchRecord(plantSearch);
    return newSearchRecord
      ? normalizeSearchRecord(newSearchRecord)
      : errorResponse(500, "Unable to create search record");
  }

  /**
   * Initiate a new search of occurrences from GBIF and combine with PFAF data.
   */
  @Get("runSearch/{searchRecordId}")
  public async runSearch(
    @Path() searchRecordId: string,
    @Res() errorResponse: TsoaResponse<500, string>,
  ): Promise<SearchRecordSummary> {
    const searchRecord = await gbifSearchesCollection.findOne({
      _id: new ObjectId(searchRecordId),
    });

    if (!searchRecord) {
      return errorResponse(500, "Unable to find search record");
    }

    if (shouldStartScraping(searchRecord)) {
      const updatedSearch = await updateSearchRecord(searchRecord._id, {
        status: "SCRAPING",
        lastRanTimestamp: Date.now(),
      });

      if (!updatedSearch) {
        return errorResponse(
          500,
          "Error updating search record, please try again",
        );
      }

      searchGbifOccurrences(updatedSearch);
      return normalizeSearchRecord(updatedSearch);
    } else {
      console.info("Will not start scraping");
      return normalizeSearchRecord(searchRecord);
    }
  }
}
