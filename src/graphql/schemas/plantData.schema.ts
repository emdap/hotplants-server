import { buildSchema } from "graphql";

const PlantSize = `
    amount: Int
    unit: PlantSizeUnit
`;

const PlantDataCommonFields = `
  scientificName: String!
  addedTimestamp: Int!
  updatedTimestamp: Int!

  isPerennial: Boolean
  maturityTime: String
  habitat: String

  commonNames: [String!]
  bloomColors: [String!]
  bloomTimes: [String!]
  soilTypes: [String!]
  lightLevels: [String!]
  hardiness: [Int!]
  uses: [String!]

  occurrenceIds: [Int!]!
  mediaUrls: [String!]!
  scrapeSources: [String!]!
`;

const makeFieldsOptional = (str: String) => str.replaceAll("!", "");

export const plantDataSchema = buildSchema(`
  type PlantData {
    ${PlantDataCommonFields}

    height: PlantSize
    spread: PlantSize

    occurrenceCoords: [[Float!]!]!
  }

  input PlantDataInput {
    ${makeFieldsOptional(PlantDataCommonFields)}

    height: PlantSizeInput
    spread: PlantSizeInput

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

  enum SortDirection {
    asc
    desc
  }

  input SortInput {
    scientificName: SortDirection
    addedTimestamp: SortDirection
    updatedTimestamp: SortDirection
  }

  type Query {
    plants(sort: SortInput, limit: Int, skip: Int, where: PlantDataInput): [PlantData]
  }
`);
