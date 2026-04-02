import { buildSchema } from "graphql";

const PlantDataCommonFields = `
  scientificName: String!
  addedTimestamp: Float!
  updatedTimestamp: Float!
  scrapeSources: [String!]!

  maturityTime: String
  physicalCharactersticsDump: String
`;

const PlantDataInterface = `
  ${PlantDataCommonFields}

  isPerennial: Boolean
  height: PlantSize
  spread: PlantSize

  habitats: [String!]
  bloomColors: [String!]
  bloomTimes: [String!]
  soilTypes: [String!]
  lightLevels: [String!]
  hardiness: [Int!]
  uses: [String!]

  thumbnailUrl: String
  commonNames: [String!]
  fullOccurrencesCount: Int
  occurrences: [PlantOccurrence!]!
`;

const GardenPlantRef = `
  addedToGardenTimestamp: Float!
  customThumbnailUrl: String
`;

const makeFieldsOptional = (str: String) => str.replaceAll("!", "");

export const dynamicSchema = buildSchema(`
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
    _id: ObjectId!
    ${PlantDataInterface}
  }

  enum PlantSizeUnit {
    meters
    centimeters
    inches
    feet
  }

  type PlantSize {
    amount: Float!
    unit: PlantSizeUnit!
  }
  
  input PlantSizeRangeInput {
    minAmount: Float
    maxAmount: Float
    unit: PlantSizeUnit!
  }

  enum PlantSortField {
    addedTimestamp
    updatedTimestamp
    scientificName
  }

  input PlantArrayFilterStringInput {
    value: [String]
    matchAll: Boolean
  }

  input PlantArrayFilterIntInput {
    value: [Int]
    matchAll: Boolean
  }

  input PlantDataInput {
    ${makeFieldsOptional(PlantDataCommonFields)}

    isPerennial: [Boolean]
    height: PlantSizeRangeInput
    spread: PlantSizeRangeInput

    commonName: String
    boundingPolyCoords: [[[Float!]!]!]

    habitats: PlantArrayFilterStringInput
    bloomColors: PlantArrayFilterStringInput
    bloomTimes: PlantArrayFilterStringInput
    soilTypes: PlantArrayFilterStringInput
    lightLevels: PlantArrayFilterStringInput
    uses: PlantArrayFilterStringInput

    hardiness: PlantArrayFilterIntInput
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
    _id: ObjectId!
    ${GardenPlantRef}
    ${PlantDataInterface}

    notes: String
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
  
    allUserGardens(gardenId: String, gardenName: String): [UserGarden!]!
    userGarden(gardenId: String, gardenName: String): UserGarden
    userGardenPlants(gardenId: String!, sort: [PlantSortInput!], offset: Int, limit: Int, where: PlantDataInput): UserGardenPlants
  }

  type Mutation {
    replaceWithProxyUrl(plantId: String!, occurrenceId: Float!, replaceUrl: String!): String
  
    createGarden(gardenName: String): UserGarden
    deleteGarden(gardenId: String!): Boolean!
    addToGarden(gardenId: String, plantId: String!): UserGarden
    removeFromGarden(gardenId: String!, plantId: String!): UserGarden
    updateGardenPlant(gardenId: String!, plantId: String!, customThumbnailUrl: String, notes: String): UserGarden
  }
`);
