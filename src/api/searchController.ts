import { Request as ExpressRequest } from "express";
import { ObjectId } from "mongodb";
import {
  Body,
  Get,
  Hidden,
  Path,
  Post,
  Request,
  Res,
  Route,
  TsoaResponse,
} from "tsoa";
import { gbifSearchesCollection } from "../config/mongodbClient";
import { EntitySearchParams } from "../config/types";
import { extractUserFromCookie } from "./util/authUtil";
import {
  createSearchRecord,
  getSearchRecordFilter,
  updateSearchRecord,
} from "./util/mongodbUtil";
import {
  normalizeSearchRecord,
  searchGbifOccurrences,
  SearchRecordSummary,
  shouldStartScraping,
} from "./util/scrapingUtil";

@Route()
export class SearchController {
  /**
   * Returns the search record that tracks data scraping for the given search params.
   */
  @Post("searchRecord")
  public async getSearchRecord(
    @Body() searchParams: EntitySearchParams,
    @Request() @Hidden() request: ExpressRequest,
    @Res() errorResponse: TsoaResponse<400 | 500, string>,
  ): Promise<SearchRecordSummary> {
    if (!searchParams.location && !searchParams.entityName) {
      errorResponse(
        400,
        "Request must include 'location' or 'entityName' to create search record",
      );
    }

    const user = await extractUserFromCookie(request.headers.cookie);
    const userId = user && new ObjectId(user.id);

    const searchRecordFields = getSearchRecordFilter(searchParams);

    const findPayload = {
      // Default out all properties so that exact match is found
      locationName: undefined,
      locationSource: undefined,
      boundingPolyCoords: undefined,
      commonName: undefined,
      scientificName: undefined,

      ...searchRecordFields,
    };

    const existingSearchRecord = await (userId
      ? gbifSearchesCollection.findOneAndUpdate(
          findPayload,
          {
            $addToSet: { userIds: userId },
          },
          { returnDocument: "after" },
        )
      : gbifSearchesCollection.findOne(findPayload));

    if (existingSearchRecord) {
      return normalizeSearchRecord(existingSearchRecord);
    }

    const newSearchRecord = await createSearchRecord(
      searchRecordFields,
      userId,
    );
    return newSearchRecord
      ? normalizeSearchRecord(newSearchRecord)
      : errorResponse(500, "Unable to create search record");
  }

  /**
   * Start a new search/scrape for the given search record.
   */
  @Get("runSearch/{searchRecordId}")
  public async runSearch(
    @Path() searchRecordId: string,
    @Request() @Hidden() request: ExpressRequest,
    @Res() errorResponse: TsoaResponse<500, string>,
  ): Promise<SearchRecordSummary> {
    const searchRecord = await gbifSearchesCollection.findOne({
      _id: new ObjectId(searchRecordId),
    });

    if (!searchRecord) {
      return errorResponse(500, "Unable to find search record");
    }

    if (shouldStartScraping(searchRecord)) {
      const user = await extractUserFromCookie(request.headers.cookie);

      const updatedSearch = await updateSearchRecord(
        searchRecord._id,
        {
          status: "SCRAPING",
          lastRanTimestamp: Date.now(),
        },
        user && new ObjectId(user.id),
      );

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
