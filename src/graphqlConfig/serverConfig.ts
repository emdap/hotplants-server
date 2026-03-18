import { ApolloServer } from "@apollo/server";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";
import { Resolvers } from "./graphql";
import {
  plantOccurrencesResolver,
  plantResolver,
  plantSearchResolver,
} from "./resolvers/plantResolvers";
import { replaceWithProxyUrlResolver } from "./resolvers/replaceWithProxyUrlResolver";
import {
  allSearchRecordsResolver,
  searchRecordDataCountsResolver,
  searchRecordResolver,
} from "./resolvers/searchRecordResolvers";
import {
  addToGardenResolver,
  allUserGardensResolver,
  createGardenResolver,
  removeFromGardenResolver,
  updateGardenPlantResolver,
  userGardenPlantsResolver,
  userGardenResolver,
} from "./resolvers/userGardenResolvers";
import { dynamicSchema } from "./schemas/dynamic.schema";
import { ApolloContext } from "./types";

const schemaPath = path.join(import.meta.dirname, "schemas/mainSchema.graphql");
const resolvers: Resolvers = {
  PlantData: {
    fullOccurrencesCount: (
      { occurrences, fullOccurrencesCount },
      _args,
      _context,
      { operation },
    ) =>
      operation.name?.value === "plant" || fullOccurrencesCount === undefined
        ? occurrences.length
        : fullOccurrencesCount,

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
    allSearchRecords: allSearchRecordsResolver,
    searchRecordDataCounts: searchRecordDataCountsResolver,

    allUserGardens: allUserGardensResolver,
    userGarden: userGardenResolver,
    userGardenPlants: userGardenPlantsResolver,
  },
  Mutation: {
    replaceWithProxyUrl: replaceWithProxyUrlResolver,

    createGarden: createGardenResolver,
    addToGarden: addToGardenResolver,
    removeFromGarden: removeFromGardenResolver,
    updateGardenPlant: updateGardenPlantResolver,
  },
};

export const apolloServer = new ApolloServer<ApolloContext>({
  typeDefs: [gql(readFileSync(schemaPath, "utf-8")), dynamicSchema],
  resolvers,
  introspection: true,
});
