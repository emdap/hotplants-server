import { ObjectId } from "mongodb";
import { Body, Post, Res, Route, TsoaResponse } from "tsoa";
import {
  createGbifSearchRecord,
  openGbifSearchRecord,
  PlantSearchParams,
} from "./util/mongodbUtil";
import {
  createGbifQuery,
  searchGbifOccurrences,
  shouldStartScraping,
} from "./util/scrapeOccurrencesUtil";

@Route("plants")
export class PlantController {
  /**
   * Initiate a new scrape of occurrences from GBIF and combine with PFAF data.
   * Return the searchRecord, which can be queried against in graphQL to check
   * the status of the scrape.
   */
  @Post("scrapeOccurrences")
  public async scrapeOccurrences(
    @Body() plantSearch: PlantSearchParams = {},
    @Res() errorResponse: TsoaResponse<500, string>
  ): Promise<ObjectId | undefined> {
    const [gbifQuery, existingSearchRecord] = await Promise.all([
      createGbifQuery(plantSearch),
      openGbifSearchRecord(plantSearch),
    ]);

    if (existingSearchRecord && !shouldStartScraping(existingSearchRecord)) {
      return existingSearchRecord._id;
    }

    const searchRecord =
      existingSearchRecord ?? (await createGbifSearchRecord(plantSearch));

    if (!searchRecord) {
      return errorResponse(500, "Unable to create search record");
    }

    searchGbifOccurrences(gbifQuery, searchRecord);

    return searchRecord._id;
  }
}
