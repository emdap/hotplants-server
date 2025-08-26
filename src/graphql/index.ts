import { ApolloServer } from "@apollo/server";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";
import { plantCollection } from "../config/mongodbClient";
import { Resolvers } from "./types";

const schemaPath = path.join(__dirname, "schema.graphql");
const resolvers: Resolvers = {
  Query: {
    plants: (_, { limit, skip, where }) => {
      const cursor = plantCollection.find(where ?? {}).limit(limit ?? 50);

      skip && cursor.skip(skip);

      return cursor.toArray();
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
export const apolloServer = new ApolloServer({
  typeDefs: gql(readFileSync(schemaPath, "utf-8")),
  resolvers,
});

// export const startGraphqlServer = async () => {
//   // Passing an ApolloServer instance to the `startStandaloneServer` function:
//   //  1. creates an Express app
//   //  2. installs your ApolloServer instance as middleware
//   //  3. prepares your app to handle incoming requests
//   const { url } = await startStandaloneServer(server, {
//     listen: { port: 3000, path: "graphql" },
//   });

//   console.debug(`graphql server ready at: ${url}`);
// };
