import { PlantsApi } from "./dataFetchers";

export const graphqlTypes = `#graphql
  type Plant {
    scientific_name: String
    common_names: [String]
    flower_colors: [String]
    height_cm: Int
  }

  type GbifPlant {
    acceptedScientificName: String
  }

  type Query {
    plants: [Plant]
    gbifPlants: [GbifPlant]
  }
`;

export const plants = [
  {
    scientific_name: "scientific poppy",
    common_names: ["poppy"],
    flower_colors: ["red", "orange"],
    height_cm: 50,
  },
];

export interface ContextValue {
  dataSources: {
    plantsApi: PlantsApi;
  };
}

export const resolvers = {
  Query: {
    plants: () => plants,
    gbifPlants: async (_: any, __: any, { dataSources }: ContextValue) => {
      return dataSources.plantsApi.getPlants();
    },
  },
};
