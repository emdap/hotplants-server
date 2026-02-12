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

export type AddToGardenResult = {
  __typename?: 'AddToGardenResult';
  _id: Scalars['ObjectId']['output'];
  gardenName: Scalars['String']['output'];
  totalPlants: Scalars['Int']['output'];
  userId: Scalars['String']['output'];
};

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
  habitat?: Maybe<Scalars['String']['output']>;
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

export type LocationSource =
  | 'custom'
  | 'search';

export type Mutation = {
  __typename?: 'Mutation';
  addToGarden?: Maybe<AddToGardenResult>;
  newGarden: Scalars['ObjectId']['output'];
  replaceWithProxyUrl?: Maybe<Scalars['String']['output']>;
};


export type MutationAddToGardenArgs = {
  gardenName?: InputMaybe<Scalars['String']['input']>;
  plantId: Scalars['String']['input'];
};


export type MutationNewGardenArgs = {
  gardenName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationReplaceWithProxyUrlArgs = {
  occurrenceId: Scalars['Float']['input'];
  plantId: Scalars['String']['input'];
  replaceUrl: Scalars['String']['input'];
};

export type PlantData = PlantDataInterface & {
  __typename?: 'PlantData';
  _id: Scalars['ObjectId']['output'];
  addedTimestamp: Scalars['Float']['output'];
  bloomColors?: Maybe<Array<Scalars['String']['output']>>;
  bloomTimes?: Maybe<Array<Scalars['String']['output']>>;
  commonNames?: Maybe<Array<Scalars['String']['output']>>;
  fullOccurrencesCount?: Maybe<Scalars['Int']['output']>;
  habitat?: Maybe<Scalars['String']['output']>;
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

export type PlantDataInput = {
  _id?: InputMaybe<Scalars['ObjectId']['input']>;
  addedTimestamp?: InputMaybe<Scalars['Float']['input']>;
  bloomColors?: InputMaybe<Array<Scalars['String']['input']>>;
  bloomTimes?: InputMaybe<Array<Scalars['String']['input']>>;
  boundingPolyCoords?: InputMaybe<Array<Array<Array<Scalars['Float']['input']>>>>;
  commonName?: InputMaybe<Scalars['String']['input']>;
  habitat?: InputMaybe<Scalars['String']['input']>;
  hardiness?: InputMaybe<Array<Scalars['Int']['input']>>;
  height?: InputMaybe<PlantSizeInput>;
  isPerennial?: InputMaybe<Scalars['Boolean']['input']>;
  lightLevels?: InputMaybe<Array<Scalars['String']['input']>>;
  maturityTime?: InputMaybe<Scalars['String']['input']>;
  physicalCharactersticsDump?: InputMaybe<Scalars['String']['input']>;
  scientificName?: InputMaybe<Scalars['String']['input']>;
  scrapeSources?: InputMaybe<Array<Scalars['String']['input']>>;
  soilTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  spread?: InputMaybe<PlantSizeInput>;
  updatedTimestamp?: InputMaybe<Scalars['Float']['input']>;
  uses?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type PlantDataInterface = {
  _id: Scalars['ObjectId']['output'];
  addedTimestamp: Scalars['Float']['output'];
  bloomColors?: Maybe<Array<Scalars['String']['output']>>;
  bloomTimes?: Maybe<Array<Scalars['String']['output']>>;
  commonNames?: Maybe<Array<Scalars['String']['output']>>;
  fullOccurrencesCount?: Maybe<Scalars['Int']['output']>;
  habitat?: Maybe<Scalars['String']['output']>;
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
  amount?: Maybe<Scalars['Int']['output']>;
  unit?: Maybe<PlantSizeUnit>;
};

export type PlantSizeInput = {
  amount?: InputMaybe<Scalars['Int']['input']>;
  unit?: InputMaybe<PlantSizeUnit>;
};

export type PlantSizeUnit =
  | 'cm'
  | 'ft'
  | 'in'
  | 'm';

export type PlantSortField =
  | 'addedTimestamp'
  | 'scientificName'
  | 'updatedTimestamp';

export type PlantSortInput = {
  direction: Scalars['Int']['input'];
  field: PlantSortField;
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
};


export type QueryAllSearchRecordsArgs = {
  booleanFilter?: InputMaybe<Array<SearchRecordBooleanFilterInput>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<SearchRecordSortInput>>;
  stringFilter?: InputMaybe<Array<SearchRecordStringFilterInput>>;
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
  gardenName: Scalars['String']['input'];
};

export type SearchRecord = {
  __typename?: 'SearchRecord';
  _id: Scalars['ObjectId']['output'];
  boundingPolyCoords: Array<Array<Array<Scalars['Float']['output']>>>;
  commonName?: Maybe<Scalars['String']['output']>;
  createdTimestamp: Scalars['Float']['output'];
  locationName: Scalars['String']['output'];
  locationSource: LocationSource;
  occurrencesOffset: Scalars['Int']['output'];
  scientificName?: Maybe<Scalars['String']['output']>;
  status: SearchRecordStatus;
  statusUpdatedTimestamp?: Maybe<Scalars['Float']['output']>;
  taxonKeys?: Maybe<Array<Scalars['Int']['output']>>;
  totalOccurrences: Scalars['Int']['output'];
};

export type SearchRecordBooleanFilterField =
  | 'commonName'
  | 'scientificName';

export type SearchRecordBooleanFilterInput = {
  field: SearchRecordBooleanFilterField;
  value: Scalars['Boolean']['input'];
};

export type SearchRecordPlantCountResults = {
  __typename?: 'SearchRecordPlantCountResults';
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
  | 'locationName'
  | 'statusUpdatedTimestamp'
  | 'totalOccurrences';

export type SearchRecordSortInput = {
  direction: Scalars['Int']['input'];
  field: SearchRecordSortField;
};

export type SearchRecordStatus =
  | 'COMPLETE'
  | 'READY'
  | 'SCRAPING';

export type SearchRecordStringFilterField =
  | 'locationSource'
  | 'status';

export type SearchRecordStringFilterInput = {
  field: SearchRecordStringFilterField;
  value: Scalars['String']['input'];
};

export type UserGarden = {
  __typename?: 'UserGarden';
  gardenName: Scalars['String']['output'];
  gardenThumbnailUrl?: Maybe<Scalars['String']['output']>;
  plants: Array<GardenPlantData>;
  totalPlants: Scalars['Int']['output'];
  userId: Scalars['String']['output'];
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
  AddToGardenResult: ResolverTypeWrapper<AddToGardenResult>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GardenPlantData: ResolverTypeWrapper<GardenPlantData>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LocationSource: LocationSource;
  Mutation: ResolverTypeWrapper<{}>;
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']['output']>;
  PlantData: ResolverTypeWrapper<PlantData>;
  PlantDataInput: PlantDataInput;
  PlantDataInterface: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['PlantDataInterface']>;
  PlantMedia: ResolverTypeWrapper<PlantMedia>;
  PlantOccurrence: ResolverTypeWrapper<PlantOccurrence>;
  PlantOccurrencesResults: ResolverTypeWrapper<PlantOccurrencesResults>;
  PlantSearchQueryResults: ResolverTypeWrapper<PlantSearchQueryResults>;
  PlantSize: ResolverTypeWrapper<PlantSize>;
  PlantSizeInput: PlantSizeInput;
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
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddToGardenResult: AddToGardenResult;
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  GardenPlantData: GardenPlantData;
  Int: Scalars['Int']['output'];
  Mutation: {};
  ObjectId: Scalars['ObjectId']['output'];
  PlantData: PlantData;
  PlantDataInput: PlantDataInput;
  PlantDataInterface: ResolversInterfaceTypes<ResolversParentTypes>['PlantDataInterface'];
  PlantMedia: PlantMedia;
  PlantOccurrence: PlantOccurrence;
  PlantOccurrencesResults: PlantOccurrencesResults;
  PlantSearchQueryResults: PlantSearchQueryResults;
  PlantSize: PlantSize;
  PlantSizeInput: PlantSizeInput;
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
}>;

export type AddToGardenResultResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['AddToGardenResult'] = ResolversParentTypes['AddToGardenResult']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  gardenName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalPlants?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  habitat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type MutationResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addToGarden?: Resolver<Maybe<ResolversTypes['AddToGardenResult']>, ParentType, ContextType, RequireFields<MutationAddToGardenArgs, 'plantId'>>;
  newGarden?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType, Partial<MutationNewGardenArgs>>;
  replaceWithProxyUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationReplaceWithProxyUrlArgs, 'occurrenceId' | 'plantId' | 'replaceUrl'>>;
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
  habitat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type PlantDataInterfaceResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['PlantDataInterface'] = ResolversParentTypes['PlantDataInterface']> = ResolversObject<{
  __resolveType: TypeResolveFn<'GardenPlantData' | 'PlantData', ParentType, ContextType>;
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  addedTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  bloomColors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  bloomTimes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  commonNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  fullOccurrencesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  habitat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['PlantSizeUnit']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  allSearchRecords?: Resolver<ResolversTypes['SearchRecordQueryResults'], ParentType, ContextType, Partial<QueryAllSearchRecordsArgs>>;
  allUserGardens?: Resolver<Array<ResolversTypes['UserGarden']>, ParentType, ContextType>;
  plant?: Resolver<Maybe<ResolversTypes['PlantData']>, ParentType, ContextType, RequireFields<QueryPlantArgs, 'id'>>;
  plantOccurrences?: Resolver<Maybe<ResolversTypes['PlantOccurrencesResults']>, ParentType, ContextType, RequireFields<QueryPlantOccurrencesArgs, 'id'>>;
  plantSearch?: Resolver<ResolversTypes['PlantSearchQueryResults'], ParentType, ContextType, Partial<QueryPlantSearchArgs>>;
  searchRecord?: Resolver<Maybe<ResolversTypes['SearchRecord']>, ParentType, ContextType, RequireFields<QuerySearchRecordArgs, 'id'>>;
  searchRecordDataCounts?: Resolver<ResolversTypes['SearchRecordPlantCountResults'], ParentType, ContextType, RequireFields<QuerySearchRecordDataCountsArgs, 'id'>>;
  userGarden?: Resolver<Maybe<ResolversTypes['UserGarden']>, ParentType, ContextType, RequireFields<QueryUserGardenArgs, 'gardenName'>>;
}>;

export type SearchRecordResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['SearchRecord'] = ResolversParentTypes['SearchRecord']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  boundingPolyCoords?: Resolver<Array<Array<Array<ResolversTypes['Float']>>>, ParentType, ContextType>;
  commonName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  locationName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locationSource?: Resolver<ResolversTypes['LocationSource'], ParentType, ContextType>;
  occurrencesOffset?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scientificName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SearchRecordStatus'], ParentType, ContextType>;
  statusUpdatedTimestamp?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taxonKeys?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  totalOccurrences?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SearchRecordPlantCountResultsResolvers<ContextType = ApolloContext, ParentType extends ResolversParentTypes['SearchRecordPlantCountResults'] = ResolversParentTypes['SearchRecordPlantCountResults']> = ResolversObject<{
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
  gardenName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gardenThumbnailUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  plants?: Resolver<Array<ResolversTypes['GardenPlantData']>, ParentType, ContextType>;
  totalPlants?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ApolloContext> = ResolversObject<{
  AddToGardenResult?: AddToGardenResultResolvers<ContextType>;
  GardenPlantData?: GardenPlantDataResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ObjectId?: GraphQLScalarType;
  PlantData?: PlantDataResolvers<ContextType>;
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
}>;

