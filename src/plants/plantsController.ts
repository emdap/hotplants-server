import { ObjectId } from "mongodb";
import { Body, Get, Path, Post, Res, Route, TsoaResponse } from "tsoa";
import { gbifSearchesCollection } from "../config/mongodbClient";
import { PlantSearchParams } from "../config/types";
import { createSearchRecord, findGbifSearchRecord } from "./util/mongodbUtil";
import {
  createGbifQuery,
  extractSearchRecordResponse,
  searchGbifOccurrences,
  SearchRecordResponse,
  shouldStartScraping,
} from "./util/scrapingUtil";

@Route("plants")
export class PlantController {
  @Post("getSearchRecord")
  public async getSearchRecord(
    @Body() plantSearch: PlantSearchParams = {},
    @Res() errorResponse: TsoaResponse<500, string>
  ): Promise<SearchRecordResponse> {
    const existingSearchRecord = await findGbifSearchRecord(plantSearch);
    if (existingSearchRecord) {
      return extractSearchRecordResponse(existingSearchRecord);
    }

    const newSearchRecord = await createSearchRecord(plantSearch);
    return newSearchRecord
      ? extractSearchRecordResponse(newSearchRecord)
      : errorResponse(500, "Unable to create search record");
  }

  /**
   * Initiate a new scrape of occurrences from GBIF and combine with PFAF data.
   */
  @Get("scrapeOccurrences/{searchRecordId}")
  public async scrapeOccurrences(
    @Path() searchRecordId: string,
    @Res() errorResponse: TsoaResponse<500, string>
  ): Promise<SearchRecordResponse> {
    const searchRecord = await gbifSearchesCollection.findOne({
      _id: new ObjectId(searchRecordId),
    });

    if (!searchRecord) {
      return errorResponse(500, "Unable to find search record");
    }

    if (shouldStartScraping(searchRecord)) {
      const updatedSearch = await gbifSearchesCollection.findOneAndUpdate(
        { _id: searchRecord._id },
        { $set: { status: "SCRAPING", statusUpdatedTimestamp: Date.now() } },
        { returnDocument: "after" }
      );

      if (!updatedSearch) {
        return errorResponse(
          500,
          "Error updating search record, please try again"
        );
      }

      const gbifQuery = await createGbifQuery(searchRecord.originalSearch);
      searchGbifOccurrences(gbifQuery, searchRecord);

      return extractSearchRecordResponse(updatedSearch);
    } else {
      console.info("Will not start scraping");
      return extractSearchRecordResponse(searchRecord);
    }
  }
}
