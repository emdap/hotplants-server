import { ObjectId } from "mongodb";
import { gbifSearchesCollection } from "../../config/mongodbClient";
import { QueryResolvers } from "../graphql";
import { applySortSkipLimit, countAndResults } from "./resolverUtils";

export const searchRecordResolver: QueryResolvers["searchRecord"] = (
  _,
  { id }
) => gbifSearchesCollection.findOne(new ObjectId(id));

export const allSearchRecordsResolver: QueryResolvers["allSearchRecords"] = (
  _,
  args
) => {
  const cursor = applySortSkipLimit(gbifSearchesCollection.find(), args);
  return countAndResults(gbifSearchesCollection, cursor);
};
