import { ObjectId } from "mongodb";
import {
  gbifSearchesCollection,
  plantCollection,
} from "../../config/mongodbClient";
import { QueryResolvers } from "../graphql";

export const plantResolver: QueryResolvers["plant"] = (_, { id }) =>
  plantCollection.findOne(new ObjectId(id));

export const plantOccurrencesResolver: QueryResolvers["plantOccurrences"] =
  async (_, { id, offset, limit }) => {
    const plant = await plantCollection.findOne(new ObjectId(id));
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

export const searchRecordResolver: QueryResolvers["searchRecord"] = (
  _,
  { id }
) => gbifSearchesCollection.findOne(new ObjectId(id));
