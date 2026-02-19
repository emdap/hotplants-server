import { SortInput } from "@/config/types";
import { Collection, Document, Sort, SortDirection } from "mongodb";
import { InputMaybe } from "../graphql";

type SortSkipLimitArgs = {
  sort?: InputMaybe<SortInput[]>;
  offset?: InputMaybe<number>;
  limit?: InputMaybe<number>;
};

export const getSortObject = <T extends SortInput>(
  sort?: InputMaybe<T[]>,
): Sort | undefined =>
  sort?.reduce<Record<string, SortDirection>>((prev, { field, value }) => {
    prev[field] = value as SortDirection;
    return prev;
  }, {});

export const paginateWithCount = ({
  sort,
  limit,
  offset,
}: SortSkipLimitArgs) => {
  const sortObject = getSortObject(sort);
  const facetSteps = [];
  sortObject && facetSteps.push({ $sort: sortObject });
  offset && facetSteps.push({ $skip: offset });
  limit && facetSteps.push({ $limit: limit });

  return {
    $facet: {
      results: facetSteps,
      count: [{ $count: "count" }],
    },
  };
};

export const aggregateAndProject = async <T extends Document>(
  collection: Collection<T>,
  pipeline: Document,
) =>
  (
    await collection
      .aggregate<{ count: number; results: T[] }>(
        pipeline.concat({
          $project: {
            results: 1,
            count: { $ifNull: [{ $arrayElemAt: ["$count.count", 0] }, 0] },
          },
        }),
      )
      .toArray()
  )[0];
