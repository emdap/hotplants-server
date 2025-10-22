import { buildSchema } from "graphql";

const PlantMedia = `
  url: String!
  occurrenceId: Float!
  isProxyUrl: Boolean
`;

const PlantSize = `
  amount: Int
  unit: PlantSizeUnit
`;

const PlantDataCommonFields = `
  scientificName: String!
  addedTimestamp: Float!
  updatedTimestamp: Float!

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


  occurrenceIds: [Float!]!
  scrapeSources: [String!]!
`;

const PlantData = `
    _id: ObjectId!
    ${PlantDataCommonFields}

    height: PlantSize
    spread: PlantSize

    commonNames: [String!]
    occurrenceCoords: [[Float!]!]!
    mediaUrls: [PlantMedia!]!
    fullMediaCount: Int
`;

const makeFieldsOptional = (str: String) => str.replaceAll(/!$/gm, "");

export const plantDataSchema = buildSchema(`
  scalar ObjectId

  type PlantData {
    ${PlantData}
  }

  input PlantDataInput {
    ${makeFieldsOptional(PlantDataCommonFields)}

    height: PlantSizeInput
    spread: PlantSizeInput

    commonName: String
    boundingBox: [Float!]
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

  type PlantMedia {
    ${PlantMedia}
  }

  enum SortDirection {
    asc
    desc
  }

  input SortInput {
    scientificName: SortDirection
    addedTimestamp: SortDirection
    updatedTimestamp: SortDirection
  }

  type PlantSearchResults {
   count: Float!
   results: [PlantData!]!
  }

  type Query {
    plant(id: String!): PlantData
    plantMedia(id: String!, offset: Int, limit: Int): [PlantMedia!]!
    plantSearch(sort: SortInput, limit: Int, offset: Int, where: PlantDataInput): PlantSearchResults!
  }

  type Mutation {
    replaceWithProxyUrl(plantId: ObjectId!, replaceUrl: String!): String
  }
`);
