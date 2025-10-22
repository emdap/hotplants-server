import { ApolloServer } from "@apollo/server";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";
import { Resolvers } from "./graphql";
import {
  plantMediaResolver,
  plantResolver,
  plantSearchResolver,
  replaceWithProxyUrlResolver,
  searchRecordResolver,
} from "./graphqlResolvers";
import { plantDataSchema } from "./schemas/plantData.schema";

const schemaPath = path.join(__dirname, "schemas/mainSchema.graphql");
const resolvers: Resolvers = {
  PlantData: {
    fullMediaCount: ({ mediaUrls }) => mediaUrls.length,
    mediaUrls: ({ mediaUrls }, _args, _context, { operation }) =>
      operation.name?.value === "plantMedia"
        ? mediaUrls
        : mediaUrls.slice(0, 10),
  },
  Query: {
    plant: plantResolver,
    plantMedia: plantMediaResolver,
    plantSearch: plantSearchResolver,
    searchRecord: searchRecordResolver,
  },
  Mutation: {
    replaceWithProxyUrl: replaceWithProxyUrlResolver,
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
export const apolloServer = new ApolloServer({
  typeDefs: [gql(readFileSync(schemaPath, "utf-8")), plantDataSchema],
  resolvers,
});
