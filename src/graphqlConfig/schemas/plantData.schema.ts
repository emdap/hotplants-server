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

const GardenPlantRef = `
  addedToGardenTimestamp: Float!
  customThumbnailUrl: String
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
    value: Int!
  }

  type PlantSearchQueryResults {
   count: Float!
   results: [PlantData!]!
  }

  type PlantOccurrencesResults {
    count: Float!
    results: [PlantOccurrence!]!
  }

  type GardenPlantRef {
    _id: ObjectId!
    ${GardenPlantRef}
  }

  type GardenPlantData implements PlantDataInterface {
    ${GardenPlantRef}
    ${PlantDataInterface}
  }

  type UserGarden {
    _id: ObjectId!
    userId: String!
    gardenName: String!
    plantRefs: [GardenPlantRef!]!
    plantCount: Float!
    gardenThumbnailUrl: String
  }

  type UserGardenPlants {
    count: Float!
    results: [GardenPlantData!]!
  }


  type Query {
    plant(id: String!, boundingPolyCoords: [[[Float!]!]!]): PlantData
    plantOccurrences(id: String!, offset: Int, limit: Int): PlantOccurrencesResults
    plantSearch(sort: [PlantSortInput!], limit: Int, offset: Int, where: PlantDataInput): PlantSearchQueryResults!
  
    allUserGardens: [UserGarden!]!
    userGarden(gardenName: String!): UserGarden
    userGardenPlants(gardenName: String!, sort: [PlantSortInput!], offset: Int, limit: Int): UserGardenPlants
  }

  type Mutation {
    replaceWithProxyUrl(plantId: String!, occurrenceId: Float!, replaceUrl: String!): String
  
    newGarden(gardenName: String): ObjectId!
    addToGarden(gardenName: String, plantId: String!): UserGarden
  }
`);
