import { ApolloServer } from "@apollo/server";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";
import { QueryResolvers } from "./graphql";
import { plantsResolver, searchRecordResolver } from "./queryResolvers";
import { plantDataSchema } from "./schemas/plantData.schema";

const schemaPath = path.join(__dirname, "schemas/mainSchema.graphql");
const resolvers: QueryResolvers = {
  Query: {
    plantSearch: plantsResolver,
    searchRecord: searchRecordResolver,
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
export const apolloServer = new ApolloServer({
  typeDefs: [gql(readFileSync(schemaPath, "utf-8")), plantDataSchema],
  resolvers,
});
