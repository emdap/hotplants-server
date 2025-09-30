import { ApolloServer } from "@apollo/server";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import { ObjectId } from "mongodb";
import path from "path";
import {
  gbifSearchesCollection,
  plantCollection,
} from "../config/mongodbClient";
import { Resolvers } from "./graphql";

const schemaPath = path.join(__dirname, "schema.graphql");
const resolvers: Resolvers = {
  Query: {
    plants: (_, { limit, skip, where }) => {
      const cursor = plantCollection.find(where ?? {}).limit(limit ?? 50);

      skip && cursor.skip(skip);

      return cursor.toArray();
    },
    searchRecords: (_, { id }) =>
      gbifSearchesCollection.findOne(new ObjectId(id)),
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
export const apolloServer = new ApolloServer({
  typeDefs: gql(readFileSync(schemaPath, "utf-8")),
  resolvers,
});
