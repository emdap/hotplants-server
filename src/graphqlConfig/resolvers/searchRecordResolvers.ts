import { SearchRecordDocument } from "@/config/types";
import { Filter, ObjectId } from "mongodb";
import {
  gbifSearchesCollection,
  plantsCollection,
} from "../../config/mongodbClient";
import {
  QueryResolvers,
  SearchRecordBooleanFilterInput,
  SearchRecordStringFilterInput,
} from "../graphql";
import { extractPlantFilter } from "./plantResolvers";
import { applySortSkipLimit, countAndResults } from "./resolverUtils";

export const searchRecordResolver: QueryResolvers["searchRecord"] = (
  _,
  { id },
) => gbifSearchesCollection.findOne(new ObjectId(id));

const extractSearchRecordFilter = ({
  stringFilter,
  booleanFilter,
}: {
  stringFilter?: SearchRecordStringFilterInput[] | null;
  booleanFilter?: SearchRecordBooleanFilterInput[] | null;
}) => {
  const filter = {} as Filter<SearchRecordDocument>;

  stringFilter?.forEach(({ field, value }) => {
    filter[field] = { $all: value };
  });
  booleanFilter?.forEach(({ field, value }) => {
    filter[field] = { [value ? "$ne" : "$eq"]: null };
  });

  return filter;
};

export const allSearchRecordsResolver: QueryResolvers["allSearchRecords"] =
  async (_, { stringFilter, booleanFilter, ...args }) => {
    const cursor = applySortSkipLimit(
      gbifSearchesCollection.find(
        extractSearchRecordFilter({ stringFilter, booleanFilter }),
      ),
      args,
    );

    return countAndResults(gbifSearchesCollection, cursor);
  };

export const searchRecordDataCountsResolver: QueryResolvers["searchRecordDataCounts"] =
  async (...args) => {
    const searchRecord = await searchRecordResolver(...args);
    if (searchRecord) {
      const { boundingPolyCoords, commonName, scientificName } = searchRecord;

      const plantFilter = extractPlantFilter({
        boundingPolyCoords,
        commonName,
        scientificName,
      });

      const plantCountPromise = plantsCollection.countDocuments(plantFilter);
      const occurrenceCountPromise = plantsCollection
        .aggregate([{ $match: plantFilter }, { $unwind: "$occurrences" }])
        .toArray();

      const [plantCount, occurrences] = await Promise.all([
        plantCountPromise,
        occurrenceCountPromise,
      ]);

      return { plantCount, occurrenceCount: occurrences.length };
    }
    return { plantCount: 0, occurrenceCount: 0 };
  };
