import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import "dotenv/config";
import createClient from "openapi-fetch";
import { PlantsApi } from "./dataFetchers";
import { ContextValue, graphqlTypes, resolvers } from "./fixtures";
import { paths } from "./gbif";

const server = new ApolloServer<ContextValue>({
  typeDefs: graphqlTypes,
  resolvers,
});

const plantClient = createClient<paths>({
  baseUrl: "https://api.gbif.org/v1/",
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({
      dataSources: {
        plantsApi: new PlantsApi(plantClient),
      },
    }),
  });

  console.log(`Ready at ${url}`);
};

startServer();
