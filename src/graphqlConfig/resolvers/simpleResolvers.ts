import { ObjectId } from "mongodb";
import {
  gbifSearchesCollection,
  plantsCollection,
} from "../../config/mongodbClient";
import { QueryResolvers } from "../graphql";
import { createFilteredCursor } from "./plantSearchResolver";

export const searchRecordResolver: QueryResolvers["searchRecord"] = (
  _,
  { id }
) => gbifSearchesCollection.findOne(new ObjectId(id));

export const plantResolver: QueryResolvers["plant"] = async (
  _,
  { id, boundingPolyCoords }
) => {
  if (!boundingPolyCoords) {
    return plantsCollection.findOne(new ObjectId(id));
  }

  const { cursor } = createFilteredCursor({ _id: id, boundingPolyCoords });
  const array = await cursor.toArray();
  return array[0];
};

export const plantOccurrencesResolver: QueryResolvers["plantOccurrences"] =
  async (_, { id, offset, limit }) => {
    const plant = await plantsCollection.findOne(new ObjectId(id));
    const useOffset = offset ?? 0;

    return (
      plant && {
        count: plant.occurrences.length,
        results: plant.occurrences.slice(
          useOffset,
          limit ? limit + useOffset : undefined
        ),
      }
    );
  };
