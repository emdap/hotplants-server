import { ApolloServer } from "@apollo/server";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";
import { Resolvers } from "./graphql";
import { plantSearchResolver } from "./resolvers/plantSearchResolver";
import { replaceWithProxyUrlResolver } from "./resolvers/replaceWithProxyUrlResolver";
import {
  plantOccurrencesResolver,
  plantResolver,
  searchRecordResolver,
} from "./resolvers/simpleResolvers";
import { plantDataSchema } from "./schemas/plantData.schema";

const schemaPath = path.join(__dirname, "schemas/mainSchema.graphql");
const resolvers: Resolvers = {
  PlantData: {
    fullOccurrencesCount: ({ occurrences }) => occurrences.length,
    occurrences: ({ occurrences }, _args, _context, { operation }) =>
      operation.name?.value === "plantOccurrences"
        ? occurrences
        : occurrences.slice(0, 10),
  },
  Query: {
    plant: plantResolver,
    plantOccurrences: plantOccurrencesResolver,
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
