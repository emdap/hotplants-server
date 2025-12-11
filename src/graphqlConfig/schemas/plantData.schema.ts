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

  type PlantData {
    ${PlantDataCommonFields}
    
    height: PlantSize
    spread: PlantSize

    thumbnailUrl: String
    commonNames: [String!]
    fullOccurrencesCount: Int
    occurrences: [PlantOccurrence!]!
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

  enum SortField {
    addedTimestamp
    updatedTimestamp
    scientificName
  }

  input SortInput {
    field: SortField!
    direction: Int!
  }

  type PlantSearchResults {
   count: Float!
   results: [PlantData!]!
  }

  type PlantOccurrencesResults {
    count: Float!
    results: [PlantOccurrence!]!
  }

  type Query {
    plant(id: String!, boundingPolyCoords: [[[Float!]!]!]): PlantData
    plantOccurrences(id: String!, offset: Int, limit: Int): PlantOccurrencesResults
    plantSearch(sort: [SortInput!], limit: Int, offset: Int, where: PlantDataInput): PlantSearchResults!
  }

  type Mutation {
    replaceWithProxyUrl(plantId: String!, occurrenceId: Float!, replaceUrl: String!): String
  }
`);
