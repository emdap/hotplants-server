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
import {
  aggregateAndProject,
  caseInsensitiveStringRegex,
  paginateWithCount,
} from "./resolverUtils";

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
    const aggregations = [
      { $match: extractSearchRecordFilter({ stringFilter, booleanFilter }) },
      paginateWithCount(args),
    ];

    return aggregateAndProject(gbifSearchesCollection, aggregations);
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
      const firstPlantPromise =
        !searchRecord.boundingPolyCoords &&
        (searchRecord.commonName || searchRecord.scientificName)
          ? plantsCollection.findOne(
              searchRecord.commonName
                ? {
                    commonNames: caseInsensitiveStringRegex(
                      searchRecord.commonName,
                    ),
                  }
                : {
                    scientificName: caseInsensitiveStringRegex(
                      searchRecord.scientificName!,
                    ),
                  },
            )
          : null;

      const occurrenceCountPromise = plantsCollection
        .aggregate([{ $match: plantFilter }, { $unwind: "$occurrences" }])
        .toArray();

      const [plantCount, firstPlant, occurrences] = await Promise.all([
        plantCountPromise,
        firstPlantPromise,
        occurrenceCountPromise,
      ]);

      const firstOccurrence = firstPlant?.occurrences[0];
      const { __typename, ...firstPlantMedia } = firstOccurrence
        ?.media?.[0] ?? { url: null };

      return {
        plantCount,
        occurrenceCount: occurrences.length,
        firstPlant:
          firstPlant && firstOccurrence && firstPlantMedia?.url
            ? {
                _id: firstPlant._id.toString(),
                thumbnailUrl: firstPlant.thumbnailUrl,
                occurrenceId: firstOccurrence.occurrenceId,
                ...firstPlantMedia,
              }
            : null,
      };
    }
    return { plantCount: 0, occurrenceCount: 0, plantImageUrl: null };
  };
