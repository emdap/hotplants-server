import type { CodegenConfig } from "@graphql-codegen/cli";
import { printSchema } from "graphql";
import { plantDataSchema } from "./schemas/plantData.schema";

const config: CodegenConfig = {
  schema: ["src/graphqlConfig/schemas/**", printSchema(plantDataSchema)],

  generates: {
    "src/graphqlConfig/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        enumsAsTypes: true,
        contextType: "./types#ApolloContext",
      },
    },
  },
};

export default config;
