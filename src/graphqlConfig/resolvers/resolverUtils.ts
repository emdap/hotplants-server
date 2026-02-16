import { SortInput } from "@/config/types";
import {
  AggregationCursor,
  Collection,
  Filter,
  FindCursor,
  Sort,
  SortDirection,
} from "mongodb";
import { InputMaybe } from "../graphql";

type Cursor<T> = FindCursor<T> | AggregationCursor<T>;

export const applySortSkipLimit = <T extends object>(
  cursor: Cursor<T>,
  {
    sort,
    limit,
    offset,
  }: {
    sort?: InputMaybe<SortInput[]>;
    offset?: InputMaybe<number>;
    limit?: InputMaybe<number>;
  },
) => {
  const sortObject = getSortObject(sort);

  sortObject && cursor.sort(sortObject);
  offset && cursor.skip(offset);
  limit && cursor.limit(limit);

  return cursor;
};

export const getSortObject = <T extends SortInput>(
  sort?: InputMaybe<T[]>,
): Sort | undefined =>
  sort?.reduce<Record<string, SortDirection>>((prev, { field, value }) => {
    prev[field] = value as SortDirection;
    return prev;
  }, {});

export const countAndResults = async <T extends object, S extends object>(
  collection: Collection<S>,
  cursor: Cursor<T>,
  filter?: Filter<S>,
) => {
  const [count, results] = await Promise.all([
    collection.countDocuments(filter),
    cursor.toArray(),
  ]);

  return { count, results };
};
