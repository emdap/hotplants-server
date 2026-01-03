import { buildSchema } from "graphql";

const PlantSize = `
  amount: Int
  unit: PlantSizeUnit
`;

const PlantDataCommonFields = `
  _id: ObjectId!

  scientificName: String!
  addedTimestamp: Float!
  updatedTimestamp: Float!
  scrapeSources: [String!]!

  isPerennial: Boolean
  maturityTime: String
  habitat: String
  physicalCharactersticsDump: String

  bloomColors: [String!]
  bloomTimes: [String!]
  soilTypes: [String!]
  lightLevels: [String!]
  hardiness: [Int!]
  uses: [String!]
`;

const PlantDataInterface = `
  ${PlantDataCommonFields}

  height: PlantSize
  spread: PlantSize

  thumbnailUrl: String
  commonNames: [String!]
  fullOccurrencesCount: Int
  occurrences: [PlantOccurrence!]!
`;

const makeFieldsOptional = (str: String) => str.replaceAll(/!$/gm, "");

export const plantDataSchema = buildSchema(`
  scalar ObjectId

  type PlantMedia {
    url: String!
    isProxyUrl: Boolean
  }

  type PlantOccurrence { 
    occurrenceId: Float!
    occurrenceCoords: [Float!]!
    media: [PlantMedia!]!
  }

  interface PlantDataInterface {
    ${PlantDataInterface}
  }

  type PlantData implements PlantDataInterface {
    ${PlantDataInterface}
  }

  input PlantDataInput {
    ${makeFieldsOptional(PlantDataCommonFields)}

    height: PlantSizeInput
    spread: PlantSizeInput

    commonName: String
    boundingPolyCoords: [[[Float!]!]!]
  }

  enum PlantSizeUnit {
    m
    cm
    in
    ft
  }

  type PlantSize {
    ${PlantSize}
  }
  
  input PlantSizeInput {
    ${PlantSize}
  }

  enum PlantSortField {
    addedTimestamp
    updatedTimestamp
    scientificName
  }

  input PlantSortInput {
    field: PlantSortField!
    direction: Int!
  }

  type PlantSearchQueryResults {
   count: Float!
   results: [PlantData!]!
  }

  type PlantOccurrencesResults {
    count: Float!
    results: [PlantOccurrence!]!
  }

  type GardenPlantData implements PlantDataInterface {
    ${PlantDataInterface}
    addedToGardenTimestamp: Float!
    customThumbnailUrl: String
  }

  type UserGarden {
    userId: String!
    gardenName: String!
    totalPlants: Int!
    gardenThumbnailUrl: String
    plants: [GardenPlantData!]!
  }

  type Query {
    plant(id: String!, boundingPolyCoords: [[[Float!]!]!]): PlantData
    plantOccurrences(id: String!, offset: Int, limit: Int): PlantOccurrencesResults
    plantSearch(sort: [PlantSortInput!], limit: Int, offset: Int, where: PlantDataInput): PlantSearchQueryResults!
  
    userGarden(gardenName: String!): UserGarden
    allUserGardens: [UserGarden!]!
  }

  type Mutation {
    replaceWithProxyUrl(plantId: String!, occurrenceId: Float!, replaceUrl: String!): String
  
    newGarden(gardenName: String): ObjectId!
    addToGarden(gardenName: String, plantId: String!): ObjectId!
  }
`);
