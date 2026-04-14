import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ApolloContext } from './types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  ObjectId: { input: any; output: any; }
};

export type EntityType =
  | 'animal'
  | 'plant';

export type GardenPlantData = PlantDataInterface & {
  __typename?: 'GardenPlantData';
  _id: Scalars['ObjectId']['output'];
  addedTimestamp: Scalars['Float']['output'];
  addedToGardenTimestamp: Scalars['Float']['output'];
  bloomColors?: Maybe<Array<Scalars['String']['output']>>;
  bloomTimes?: Maybe<Array<Scalars['String']['output']>>;
  commonNames?: Maybe<Array<Scalars['String']['output']>>;
  customThumbnailUrl?: Maybe<Scalars['String']['output']>;
  fullOccurrencesCount?: Maybe<Scalars['Int']['output']>;
  habitats?: Maybe<Array<Scalars['String']['output']>>;
  hardiness?: Maybe<Array<Scalars['Int']['output']>>;
  height?: Maybe<PlantSize>;
  isPerennial?: Maybe<Scalars['Boolean']['output']>;
  lightLevels?: Maybe<Array<Scalars['String']['output']>>;
  maturityTime?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  occurrences: Array<PlantOccurrence>;
  physicalCharactersticsDump?: Maybe<Scalars['String']['output']>;
  scientificName: Scalars['String']['output'];
  scrapeSources: Array<Scalars['String']['output']>;
  soilTypes?: Maybe<Array<Scalars['String']['output']>>;
  spread?: Maybe<PlantSize>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  updatedTimestamp: Scalars['Float']['output'];
  uses?: Maybe<Array<Scalars['String']['output']>>;
};

export type GardenPlantRef = {
  __typename?: 'GardenPlantRef';
  _id: Scalars['ObjectId']['output'];
  addedToGardenTimestamp: Scalars['Float']['output'];
  customThumbnailUrl?: Maybe<Scalars['String']['output']>;
};

export type LocationSource =
  | 'custom'
  | 'search';

export type Mutation = {
  __typename?: 'Mutation';
  addToGarden?: Maybe<UserGarden>;
  createGarden?: Maybe<UserGarden>;
  deleteGarden: Scalars['Boolean']['output'];
  removeFromGarden?: Maybe<UserGarden>;
  replaceWithProxyUrl?: Maybe<Scalars['String']['output']>;
  updateGardenPlant?: Maybe<UserGarden>;
};


export type MutationAddToGardenArgs = {
  gardenId?: InputMaybe<Scalars['String']['input']>;
  plantId: Scalars['String']['input'];
};


export type MutationCreateGardenArgs = {
  gardenName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteGardenArgs = {
  gardenId: Scalars['String']['input'];
};


export type MutationRemoveFromGardenArgs = {
  gardenId: Scalars['String']['input'];
  plantId: Scalars['String']['input'];
};


export type MutationReplaceWithProxyUrlArgs = {
  occurrenceId: Scalars['Float']['input'];
  plantId: Scalars['String']['input'];
  replaceUrl: Scalars['String']['input'];
};


export type MutationUpdateGardenPlantArgs = {
  customThumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  gardenId: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  plantId: Scalars['String']['input'];
};

export type PlantArrayFilterIntInput = {
  matchAll?: InputMaybe<Scalars['Boolean']['input']>;
  value?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type PlantArrayFilterStringInput = {
  matchAll?: InputMaybe<Scalars['Boolean']['input']>;
  value?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PlantData = PlantDataInterface & {
  __typename?: 'PlantData';
  _id: Scalars['ObjectId']['output'];
  addedTimestamp: Scalars['Float']['output'];
  bloomColors?: Maybe<Array<Scalars['String']['output']>>;
  bloomTimes?: Maybe<Array<Scalars['String']['output']>>;
  commonNames?: Maybe<Array<Scalars['String']['output']>>;
  fullOccurrencesCount?: Maybe<Scalars['Int']['output']>;
  habitats?: Maybe<Array<Scalars['String']['output']>>;
  hardiness?: Maybe<Array<Scalars['Int']['output']>>;
  height?: Maybe<PlantSize>;
  isPerennial?: Maybe<Scalars['Boolean']['output']>;
  lightLevels?: Maybe<Array<Scalars['String']['output']>>;
  maturityTime?: Maybe<Scalars['String']['output']>;
  occurrences: Array<PlantOccurrence>;
  physicalCharactersticsDump?: Maybe<Scalars['String']['output']>;
  scientificName: Scalars['String']['output'];
  scrapeSources: Array<Scalars['String']['output']>;
  soilTypes?: Maybe<Array<Scalars['String']['output']>>;
  spread?: Maybe<PlantSize>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  updatedTimestamp: Scalars['Float']['output'];
  uses?: Maybe<Array<Scalars['String']['output']>>;
};

export type PlantDataExcerpt = {
  __typename?: 'PlantDataExcerpt';
  _id: Scalars['String']['output'];
  isProxyUrl?: Maybe<Scalars['Boolean']['output']>;
  occurrenceId: Scalars['Float']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type PlantDataInput = {
  addedTimestamp?: InputMaybe<Scalars['Float']['input']>;
  bloomColors?: InputMaybe<PlantArrayFilterStringInput>;
  bloomTimes?: InputMaybe<PlantArrayFilterStringInput>;
  boundingPolyCoords?: InputMaybe<Array<Array<Array<Scalars['Float']['input']>>>>;
  commonName?: InputMaybe<Scalars['String']['input']>;
  commonNameIncludes?: InputMaybe<Scalars['String']['input']>;
  habitats?: InputMaybe<PlantArrayFilterStringInput>;
  hardiness?: InputMaybe<PlantArrayFilterIntInput>;
  hasScrapedData?: InputMaybe<Scalars['Boolean']['input']>;
  height?: InputMaybe<PlantSizeRangeInput>;
  isPerennial?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lightLevels?: InputMaybe<PlantArrayFilterStringInput>;
  maturityTime?: InputMaybe<Scalars['String']['input']>;
  physicalCharactersticsDump?: InputMaybe<Scalars['String']['input']>;
  scientificName?: InputMaybe<Scalars['String']['input']>;
  scientificNameIncludes?: InputMaybe<Scalars['String']['input']>;
  scrapeSources?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  soilTypes?: InputMaybe<PlantArrayFilterStringInput>;
  spread?: InputMaybe<PlantSizeRangeInput>;
  updatedTimestamp?: InputMaybe<Scalars['Float']['input']>;
  uses?: InputMaybe<PlantArrayFilterStringInput>;
};

export type PlantDataInterface = {
  addedTimestamp: Scalars['Float']['output'];
  bloomColors?: Maybe<Array<Scalars['String']['output']>>;
  bloomTimes?: Maybe<Array<Scalars['String']['output']>>;
  commonNames?: Maybe<Array<Scalars['String']['output']>>;
  fullOccurrencesCount?: Maybe<Scalars['Int']['output']>;
  habitats?: Maybe<Array<Scalars['String']['output']>>;
  hardiness?: Maybe<Array<Scalars['Int']['output']>>;
  height?: Maybe<PlantSize>;
  isPerennial?: Maybe<Scalars['Boolean']['output']>;
  lightLevels?: Maybe<Array<Scalars['String']['output']>>;
  maturityTime?: Maybe<Scalars['String']['output']>;
  occurrences: Array<PlantOccurrence>;
  physicalCharactersticsDump?: Maybe<Scalars['String']['output']>;
  scientificName: Scalars['String']['output'];
  scrapeSources: Array<Scalars['String']['output']>;
  soilTypes?: Maybe<Array<Scalars['String']['output']>>;
  spread?: Maybe<PlantSize>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  updatedTimestamp: Scalars['Float']['output'];
  uses?: Maybe<Array<Scalars['String']['output']>>;
};

export type PlantMedia = {
  __typename?: 'PlantMedia';
  isProxyUrl?: Maybe<Scalars['Boolean']['output']>;
  url: Scalars['String']['output'];
};

export type PlantOccurrence = {
  __typename?: 'PlantOccurrence';
  media: Array<PlantMedia>;
  occurrenceCoords: Array<Scalars['Float']['output']>;
  occurrenceId: Scalars['Float']['output'];
};

export type PlantOccurrencesResults = {
  __typename?: 'PlantOccurrencesResults';
  count: Scalars['Float']['output'];
  results: Array<PlantOccurrence>;
};

export type PlantSearchQueryResults = {
  __typename?: 'PlantSearchQueryResults';
  count: Scalars['Float']['output'];
  results: Array<PlantData>;
};

export type PlantSize = {
  __typename?: 'PlantSize';
  amount: Scalars['Float']['output'];
  unit: PlantSizeUnit;
};

export type PlantSizeRangeInput = {
  maxAmount?: InputMaybe<Scalars['Float']['input']>;
  minAmount?: InputMaybe<Scalars['Float']['input']>;
  unit: PlantSizeUnit;
};

export type PlantSizeUnit =
  | 'centimeters'
  | 'feet'
  | 'inches'
  | 'meters';

export type PlantSortField =
  | 'addedTimestamp'
  | 'scientificName'
  | 'updatedTimestamp';

export type PlantSortInput = {
  field: PlantSortField;
  value: Scalars['Int']['input'];
};

export type Query = {
  __typename?: 'Query';
  allSearchRecords: SearchRecordQueryResults;
  allUserGardens: Array<UserGarden>;
  plant?: Maybe<PlantData>;
  plantOccurrences?: Maybe<PlantOccurrencesResults>;
  plantSearch: PlantSearchQueryResults;
  searchRecord?: Maybe<SearchRecord>;
  searchRecordDataCounts: SearchRecordPlantCountResults;
  userGarden?: Maybe<UserGarden>;
  userGardenPlants?: Maybe<UserGardenPlants>;
};


export type QueryAllSearchRecordsArgs = {
  booleanFilter?: InputMaybe<Array<SearchRecordBooleanFilterInput>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<SearchRecordSortInput>>;
  stringFilter?: InputMaybe<Array<SearchRecordStringFilterInput>>;
};


export type QueryAllUserGardensArgs = {
  gardenId?: InputMaybe<Scalars['String']['input']>;
  gardenName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlantArgs = {
  boundingPolyCoords?: InputMaybe<Array<Array<Array<Scalars['Float']['input']>>>>;
  id: Scalars['String']['input'];
};


export type QueryPlantOccurrencesArgs = {
  id: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPlantSearchArgs = {
  entityType: EntityType;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<PlantSortInput>>;
  where?: InputMaybe<PlantDataInput>;
};


export type QuerySearchRecordArgs = {
  id: Scalars['String']['input'];
};


export type QuerySearchRecordDataCountsArgs = {
  id: Scalars['String']['input'];
};


export type QueryUserGardenArgs = {
  gardenId?: InputMaybe<Scalars['String']['input']>;
  gardenName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserGardenPlantsArgs = {
  gardenId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<PlantSortInput>>;
  where?: InputMaybe<PlantDataInput>;
};

export type SearchRecord = {
  __typename?: 'SearchRecord';
  _id: Scalars['ObjectId']['output'];
  boundingPolyCoords?: Maybe<Array<Array<Array<Scalars['Float']['output']>>>>;
  commonName?: Maybe<Scalars['String']['output']>;
  createdTimestamp: Scalars['Float']['output'];
  entityType: EntityType;
  lastRanTimestamp?: Maybe<Scalars['Float']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  locationSource?: Maybe<LocationSource>;
  occurrencesOffset: Scalars['Int']['output'];
  scientificName?: Maybe<Scalars['String']['output']>;
  status: SearchRecordStatus;
  taxonKeys?: Maybe<Array<Scalars['Int']['output']>>;
  totalOccurrences: Scalars['Int']['output'];
  userIds?: Maybe<Array<Scalars['ObjectId']['output']>>;
};

export type SearchRecordBooleanFilterField =
  | 'commonName'
  | 'scientificName'
  | 'userSearch';

export type SearchRecordBooleanFilterInput = {
  field: SearchRecordBooleanFilterField;
  value: Scalars['Boolean']['input'];
};

export type SearchRecordPlantCountResults = {
  __typename?: 'SearchRecordPlantCountResults';
  firstPlant?: Maybe<PlantDataExcerpt>;
  occurrenceCount: Scalars['Float']['output'];
  plantCount: Scalars['Float']['output'];
};

export type SearchRecordQueryResults = {
  __typename?: 'SearchRecordQueryResults';
  count: Scalars['Float']['output'];
  results: Array<SearchRecord>;
};

export type SearchRecordSortField =
  | 'createdTimestamp'
  | 'lastRanTimestamp'
  | 'locationName'
  | 'totalOccurrences';

export type SearchRecordSortInput = {
  field: SearchRecordSortField;
  value: Scalars['Int']['input'];
};

export type SearchRecordStatus =
  | 'COMPLETE'
  | 'READY'
  | 'SCRAPING';

export type SearchRecordStringFilterField =
  | 'entityType'
  | 'locationSource'
  | 'status';

export type SearchRecordStringFilterInput = {
  field: SearchRecordStringFilterField;
  value: Array<Scalars['String']['input']>;
};

export type UserGarden = {
  __typename?: 'UserGarden';
  _id: Scalars['ObjectId']['output'];
  gardenName: Scalars['String']['output'];
  gardenThumbnailUrl?: Maybe<Scalars['String']['output']>;
  plantCount: Scalars['Float']['output'];
  plantRefs: Array<GardenPlantRef>;
  userId: Scalars['String']['output'];
};

export type UserGardenPlants = {
  __typename?: 'UserGardenPlants';
  count: Scalars['Float']['output'];
  results: Array<GardenPlantData>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  PlantDataInterface: ( GardenPlantData ) | ( PlantData );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  EntityType: EntityType;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GardenPlantData: ResolverTypeWrapper<GardenPlantData>;
  GardenPlantRef: ResolverTypeWrapper<GardenPlantRef>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LocationSource: LocationSource;
  Mutation: ResolverTypeWrapper<{}>;
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']['output']>;
  PlantArrayFilterIntInput: PlantArrayFilterIntInput;
  PlantArrayFilterStringInput: PlantArrayFilterStringInput;
  PlantData: ResolverTypeWrapper<PlantData>;
  PlantDataExcerpt: ResolverTypeWrapper<PlantDataExcerpt>;
  PlantDataInput: PlantDataInput;
  PlantDataInterface: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['PlantDataInterface']>;
  PlantMedia: ResolverTypeWrapper<PlantMedia>;
  PlantOccurrence: ResolverTypeWrapper<PlantOccurrence>;
  PlantOccurrencesResults: ResolverTypeWrapper<PlantOccurrencesResults>;
  PlantSearchQueryResults: ResolverTypeWrapper<PlantSearchQueryResults>;
  PlantSize: ResolverTypeWrapper<PlantSize>;
  PlantSizeRangeInput: PlantSizeRangeInput;
  PlantSizeUnit: PlantSizeUnit;
  PlantSortField: PlantSortField;
  PlantSortInput: PlantSortInput;
  Query: ResolverTypeWrapper<{}>;
  SearchRecord: ResolverTypeWrapper<SearchRecord>;
  SearchRecordBooleanFilterField: SearchRecordBooleanFilterField;
  SearchRecordBooleanFilterInput: SearchRecordBooleanFilterInput;
  SearchRecordPlantCountResults: ResolverTypeWrapper<SearchRecordPlantCountResults>;
  SearchRecordQueryResults: ResolverTypeWrapper<SearchRecordQueryResults>;
  SearchRecordSortField: SearchRecordSortField;
  SearchRecordSortInput: SearchRecordSortInput;
  SearchRecordStatus: SearchRecordStatus;
  SearchRecordStringFilterField: SearchRecordStringFilterField;
  SearchRecordStringFilterInput: SearchRecordStringFilterInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UserGarden: ResolverTypeWrapper<UserGarden>;
  UserGardenPlants: ResolverTypeWrapper<UserGardenPlants>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  GardenPlantData: GardenPlantData;
  GardenPlantRef: GardenPlantRef;
  Int: Scalars['Int']['output'];
  Mutation: {};
  ObjectId: Scalars['ObjectId']['output'];
  PlantArrayFilterIntInput: PlantArrayFilterIntInput;
  PlantArrayFilterStringInput: PlantArrayFilterStringInput;
  PlantData: PlantData;
  PlantDataExcerpt: PlantDataExcerpt;
  PlantDataInput: PlantDataInput;
  PlantDataInterface: ResolversInterfaceTypes<ResolversParentTypes>['PlantDataInterface'];
  PlantMedia: PlantMedia;
  PlantOccurrence: PlantOccurrence;
  PlantOccurrencesResults: PlantOccurrencesResults;
  PlantSearchQueryResults: PlantSearchQueryResults;
  PlantSize: PlantSize;
  PlantSizeRangeInput: PlantSizeRangeInput;
  PlantSortInput: PlantSortInput;
  Query: {};
  SearchRecord: SearchRecord;
  SearchRecordBooleanFilterInput: SearchRecordBooleanFilterInput;
  SearchRecordPlantCountResults: SearchRecordPlantCountResults;
  SearchRecordQueryResults: SearchRecordQueryResults;
  SearchRecordSortInput: SearchRecordSortInput;
  SearchRecordStringFilterInput: SearchRecordStringFilterInput;
  String: Scalars['String']['output'];
  UserGarden: UserGarden;
  UserGardenPlants: UserGardenPlants;
}>;

export type GardenPlantDataResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['GardenPlantData'] = ResolversParentTypes['GardenPlantData']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  addedTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  addedToGardenTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  bloomColors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  bloomTimes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  commonNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  customThumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fullOccurrencesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  habitats?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  hardiness?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  isPerennial?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lightLevels?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  maturityTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  occurrences?: Resolver<Array<ResolversTypes['PlantOccurrence']>, ParentType, ContextType>;
  physicalCharactersticsDump?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scientificName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scrapeSources?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  soilTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  spread?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  thumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  uses?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GardenPlantRefResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['GardenPlantRef'] = ResolversParentTypes['GardenPlantRef']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  addedToGardenTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  customThumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addToGarden?: Resolver<Maybe<ResolversTypes['UserGarden']>, ParentType, ContextType, RequireFields<MutationAddToGardenArgs, 'plantId'>>;
  createGarden?: Resolver<Maybe<ResolversTypes['UserGarden']>, ParentType, ContextType, Partial<MutationCreateGardenArgs>>;
  deleteGarden?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteGardenArgs, 'gardenId'>>;
  removeFromGarden?: Resolver<Maybe<ResolversTypes['UserGarden']>, ParentType, ContextType, RequireFields<MutationRemoveFromGardenArgs, 'gardenId' | 'plantId'>>;
  replaceWithProxyUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationReplaceWithProxyUrlArgs, 'occurrenceId' | 'plantId' | 'replaceUrl'>>;
  updateGardenPlant?: Resolver<Maybe<ResolversTypes['UserGarden']>, ParentType, ContextType, RequireFields<MutationUpdateGardenPlantArgs, 'gardenId' | 'plantId'>>;
}>;

export interface ObjectIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ObjectId'], any> {
  name: 'ObjectId';
}

export type PlantDataResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantData'] = ResolversParentTypes['PlantData']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  addedTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  bloomColors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  bloomTimes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  commonNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  fullOccurrencesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  habitats?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  hardiness?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  isPerennial?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lightLevels?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  maturityTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  occurrences?: Resolver<Array<ResolversTypes['PlantOccurrence']>, ParentType, ContextType>;
  physicalCharactersticsDump?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scientificName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scrapeSources?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  soilTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  spread?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  thumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  uses?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantDataExcerptResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantDataExcerpt'] = ResolversParentTypes['PlantDataExcerpt']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isProxyUrl?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  occurrenceId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  thumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantDataInterfaceResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantDataInterface'] = ResolversParentTypes['PlantDataInterface']> = ResolversObject<{
  __resolveType: TypeResolveFn<'GardenPlantData' | 'PlantData', ParentType, ContextType>;
  addedTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  bloomColors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  bloomTimes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  commonNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  fullOccurrencesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  habitats?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  hardiness?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  isPerennial?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lightLevels?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  maturityTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  occurrences?: Resolver<Array<ResolversTypes['PlantOccurrence']>, ParentType, ContextType>;
  physicalCharactersticsDump?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scientificName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scrapeSources?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  soilTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  spread?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  thumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  uses?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
}>;

export type PlantMediaResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantMedia'] = ResolversParentTypes['PlantMedia']> = ResolversObject<{
  isProxyUrl?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantOccurrenceResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantOccurrence'] = ResolversParentTypes['PlantOccurrence']> = ResolversObject<{
  media?: Resolver<Array<ResolversTypes['PlantMedia']>, ParentType, ContextType>;
  occurrenceCoords?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  occurrenceId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantOccurrencesResultsResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantOccurrencesResults'] = ResolversParentTypes['PlantOccurrencesResults']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  results?: Resolver<Array<ResolversTypes['PlantOccurrence']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantSearchQueryResultsResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantSearchQueryResults'] = ResolversParentTypes['PlantSearchQueryResults']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  results?: Resolver<Array<ResolversTypes['PlantData']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantSizeResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantSize'] = ResolversParentTypes['PlantSize']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['PlantSizeUnit'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  allSearchRecords?: Resolver<ResolversTypes['SearchRecordQueryResults'], ParentType, ContextType, Partial<QueryAllSearchRecordsArgs>>;
  allUserGardens?: Resolver<Array<ResolversTypes['UserGarden']>, ParentType, ContextType, Partial<QueryAllUserGardensArgs>>;
  plant?: Resolver<Maybe<ResolversTypes['PlantData']>, ParentType, ContextType, RequireFields<QueryPlantArgs, 'id'>>;
  plantOccurrences?: Resolver<Maybe<ResolversTypes['PlantOccurrencesResults']>, ParentType, ContextType, RequireFields<QueryPlantOccurrencesArgs, 'id'>>;
  plantSearch?: Resolver<ResolversTypes['PlantSearchQueryResults'], ParentType, ContextType, RequireFields<QueryPlantSearchArgs, 'entityType'>>;
  searchRecord?: Resolver<Maybe<ResolversTypes['SearchRecord']>, ParentType, ContextType, RequireFields<QuerySearchRecordArgs, 'id'>>;
  searchRecordDataCounts?: Resolver<ResolversTypes['SearchRecordPlantCountResults'], ParentType, ContextType, RequireFields<QuerySearchRecordDataCountsArgs, 'id'>>;
  userGarden?: Resolver<Maybe<ResolversTypes['UserGarden']>, ParentType, ContextType, Partial<QueryUserGardenArgs>>;
  userGardenPlants?: Resolver<Maybe<ResolversTypes['UserGardenPlants']>, ParentType, ContextType, RequireFields<QueryUserGardenPlantsArgs, 'gardenId'>>;
}>;

export type SearchRecordResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['SearchRecord'] = ResolversParentTypes['SearchRecord']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  boundingPolyCoords?: Resolver<Maybe<Array<Array<Array<ResolversTypes['Float']>>>>, ParentType, ContextType>;
  commonName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  entityType?: Resolver<ResolversTypes['EntityType'], ParentType, ContextType>;
  lastRanTimestamp?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  locationName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locationSource?: Resolver<Maybe<ResolversTypes['LocationSource']>, ParentType, ContextType>;
  occurrencesOffset?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scientificName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SearchRecordStatus'], ParentType, ContextType>;
  taxonKeys?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  totalOccurrences?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userIds?: Resolver<Maybe<Array<ResolversTypes['ObjectId']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SearchRecordPlantCountResultsResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['SearchRecordPlantCountResults'] = ResolversParentTypes['SearchRecordPlantCountResults']> = ResolversObject<{
  firstPlant?: Resolver<Maybe<ResolversTypes['PlantDataExcerpt']>, ParentType, ContextType>;
  occurrenceCount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  plantCount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SearchRecordQueryResultsResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['SearchRecordQueryResults'] = ResolversParentTypes['SearchRecordQueryResults']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  results?: Resolver<Array<ResolversTypes['SearchRecord']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserGardenResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['UserGarden'] = ResolversParentTypes['UserGarden']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  gardenName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gardenThumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  plantCount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  plantRefs?: Resolver<Array<ResolversTypes['GardenPlantRef']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserGardenPlantsResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['UserGardenPlants'] = ResolversParentTypes['UserGardenPlants']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  results?: Resolver<Array<ResolversTypes['GardenPlantData']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ApolloContext> = ResolversObject<{
  GardenPlantData?: GardenPlantDataResolvers<ContextType>;
  GardenPlantRef?: GardenPlantRefResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ObjectId?: GraphQLScalarType;
  PlantData?: PlantDataResolvers<ContextType>;
  PlantDataExcerpt?: PlantDataExcerptResolvers<ContextType>;
  PlantDataInterface?: PlantDataInterfaceResolvers<ContextType>;
  PlantMedia?: PlantMediaResolvers<ContextType>;
  PlantOccurrence?: PlantOccurrenceResolvers<ContextType>;
  PlantOccurrencesResults?: PlantOccurrencesResultsResolvers<ContextType>;
  PlantSearchQueryResults?: PlantSearchQueryResultsResolvers<ContextType>;
  PlantSize?: PlantSizeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SearchRecord?: SearchRecordResolvers<ContextType>;
  SearchRecordPlantCountResults?: SearchRecordPlantCountResultsResolvers<ContextType>;
  SearchRecordQueryResults?: SearchRecordQueryResultsResolvers<ContextType>;
  UserGarden?: UserGardenResolvers<ContextType>;
  UserGardenPlants?: UserGardenPlantsResolvers<ContextType>;
}>;

