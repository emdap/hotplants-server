import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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

export type Mutation = {
  __typename?: 'Mutation';
  replaceWithProxyUrl?: Maybe<Scalars['String']['output']>;
};


export type MutationReplaceWithProxyUrlArgs = {
  occurrenceId: Scalars['Float']['input'];
  plantId: Scalars['String']['input'];
  replaceUrl: Scalars['String']['input'];
};

export type PlantData = {
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

export type PlantSearchResults = {
  __typename?: 'PlantSearchResults';
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

export type Query = {
  __typename?: 'Query';
  plant?: Maybe<PlantData>;
  plantOccurrences?: Maybe<PlantOccurrencesResults>;
  plantSearch: PlantSearchResults;
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
  sort?: InputMaybe<Array<SortInput>>;
  where?: InputMaybe<PlantDataInput>;
};

export type SortField =
  | 'addedTimestamp'
  | 'scientificName'
  | 'updatedTimestamp';

export type SortInput = {
  direction: Scalars['Int']['input'];
  field: SortField;
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



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']['output']>;
  PlantData: ResolverTypeWrapper<PlantData>;
  PlantDataInput: PlantDataInput;
  PlantMedia: ResolverTypeWrapper<PlantMedia>;
  PlantOccurrence: ResolverTypeWrapper<PlantOccurrence>;
  PlantOccurrencesResults: ResolverTypeWrapper<PlantOccurrencesResults>;
  PlantSearchResults: ResolverTypeWrapper<PlantSearchResults>;
  PlantSize: ResolverTypeWrapper<PlantSize>;
  PlantSizeInput: PlantSizeInput;
  PlantSizeUnit: PlantSizeUnit;
  Query: ResolverTypeWrapper<{}>;
  SortField: SortField;
  SortInput: SortInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  ObjectId: Scalars['ObjectId']['output'];
  PlantData: PlantData;
  PlantDataInput: PlantDataInput;
  PlantMedia: PlantMedia;
  PlantOccurrence: PlantOccurrence;
  PlantOccurrencesResults: PlantOccurrencesResults;
  PlantSearchResults: PlantSearchResults;
  PlantSize: PlantSize;
  PlantSizeInput: PlantSizeInput;
  Query: {};
  SortInput: SortInput;
  String: Scalars['String']['output'];
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  replaceWithProxyUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationReplaceWithProxyUrlArgs, 'occurrenceId' | 'plantId' | 'replaceUrl'>>;
}>;

export interface ObjectIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ObjectId'], any> {
  name: 'ObjectId';
}

export type PlantDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantData'] = ResolversParentTypes['PlantData']> = ResolversObject<{
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
  updatedTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  uses?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantMediaResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantMedia'] = ResolversParentTypes['PlantMedia']> = ResolversObject<{
  isProxyUrl?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantOccurrenceResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantOccurrence'] = ResolversParentTypes['PlantOccurrence']> = ResolversObject<{
  media?: Resolver<Array<ResolversTypes['PlantMedia']>, ParentType, ContextType>;
  occurrenceCoords?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  occurrenceId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantOccurrencesResultsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantOccurrencesResults'] = ResolversParentTypes['PlantOccurrencesResults']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  results?: Resolver<Array<ResolversTypes['PlantOccurrence']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantSearchResultsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantSearchResults'] = ResolversParentTypes['PlantSearchResults']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  results?: Resolver<Array<ResolversTypes['PlantData']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantSizeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantSize'] = ResolversParentTypes['PlantSize']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['PlantSizeUnit']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  plant?: Resolver<Maybe<ResolversTypes['PlantData']>, ParentType, ContextType, RequireFields<QueryPlantArgs, 'id'>>;
  plantOccurrences?: Resolver<Maybe<ResolversTypes['PlantOccurrencesResults']>, ParentType, ContextType, RequireFields<QueryPlantOccurrencesArgs, 'id'>>;
  plantSearch?: Resolver<ResolversTypes['PlantSearchResults'], ParentType, ContextType, Partial<QueryPlantSearchArgs>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Mutation?: MutationResolvers<ContextType>;
  ObjectId?: GraphQLScalarType;
  PlantData?: PlantDataResolvers<ContextType>;
  PlantMedia?: PlantMediaResolvers<ContextType>;
  PlantOccurrence?: PlantOccurrenceResolvers<ContextType>;
  PlantOccurrencesResults?: PlantOccurrencesResultsResolvers<ContextType>;
  PlantSearchResults?: PlantSearchResultsResolvers<ContextType>;
  PlantSize?: PlantSizeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

