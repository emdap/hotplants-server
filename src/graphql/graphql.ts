import { GraphQLResolveInfo } from 'graphql';
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
};

export type PlantData = {
  __typename?: 'PlantData';
  addedTimestamp: Scalars['Int']['output'];
  bloomColors?: Maybe<Array<Scalars['String']['output']>>;
  bloomTimes?: Maybe<Array<Scalars['String']['output']>>;
  commonNames?: Maybe<Array<Scalars['String']['output']>>;
  habitat?: Maybe<Scalars['String']['output']>;
  hardiness?: Maybe<Array<Scalars['Int']['output']>>;
  height?: Maybe<PlantSize>;
  isPerennial?: Maybe<Scalars['Boolean']['output']>;
  lightLevels?: Maybe<Array<Scalars['String']['output']>>;
  maturityTime?: Maybe<Scalars['String']['output']>;
  mediaUrls: Array<Scalars['String']['output']>;
  occurrenceCoords: Array<Array<Scalars['Float']['output']>>;
  occurrenceIds: Array<Scalars['Float']['output']>;
  scientificName: Scalars['String']['output'];
  scrapeSources: Array<Scalars['String']['output']>;
  soilTypes?: Maybe<Array<Scalars['String']['output']>>;
  spread?: Maybe<PlantSize>;
  updatedTimestamp: Scalars['Int']['output'];
  uses?: Maybe<Array<Scalars['String']['output']>>;
};

export type PlantDataInput = {
  addedTimestamp?: InputMaybe<Scalars['Int']['input']>;
  bloomColors?: InputMaybe<Array<Scalars['String']['input']>>;
  bloomTimes?: InputMaybe<Array<Scalars['String']['input']>>;
  boundingBox?: InputMaybe<Array<Scalars['Float']['input']>>;
  commonName?: InputMaybe<Scalars['String']['input']>;
  habitat?: InputMaybe<Scalars['String']['input']>;
  hardiness?: InputMaybe<Array<Scalars['Int']['input']>>;
  height?: InputMaybe<PlantSizeInput>;
  isPerennial?: InputMaybe<Scalars['Boolean']['input']>;
  lightLevels?: InputMaybe<Array<Scalars['String']['input']>>;
  maturityTime?: InputMaybe<Scalars['String']['input']>;
  mediaUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  occurrenceIds?: InputMaybe<Array<Scalars['Float']['input']>>;
  scientificName?: InputMaybe<Scalars['String']['input']>;
  scrapeSources?: InputMaybe<Array<Scalars['String']['input']>>;
  soilTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  spread?: InputMaybe<PlantSizeInput>;
  updatedTimestamp?: InputMaybe<Scalars['Int']['input']>;
  uses?: InputMaybe<Array<Scalars['String']['input']>>;
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

export enum PlantSizeUnit {
  Cm = 'cm',
  Ft = 'ft',
  In = 'in',
  M = 'm'
}

export type Query = {
  __typename?: 'Query';
  plants: Array<PlantData>;
  searchRecord?: Maybe<SearchRecord>;
};


export type QueryPlantsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<SortInput>;
  where?: InputMaybe<PlantDataInput>;
};


export type QuerySearchRecordArgs = {
  id: Scalars['String']['input'];
};

export type SearchRecord = {
  __typename?: 'SearchRecord';
  endOfRecords?: Maybe<Scalars['Boolean']['output']>;
  jsonStringSearch: Scalars['String']['output'];
  lastAddedCount?: Maybe<Scalars['Int']['output']>;
  status: SearchRecordStatus;
  totalOccurrences: Scalars['Int']['output'];
  uniqueOccurrences: Scalars['Int']['output'];
};

export enum SearchRecordStatus {
  Done = 'DONE',
  Scraping = 'SCRAPING'
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type SortInput = {
  addedTimestamp?: InputMaybe<SortDirection>;
  scientificName?: InputMaybe<SortDirection>;
  updatedTimestamp?: InputMaybe<SortDirection>;
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
  PlantData: ResolverTypeWrapper<PlantData>;
  PlantDataInput: PlantDataInput;
  PlantSize: ResolverTypeWrapper<PlantSize>;
  PlantSizeInput: PlantSizeInput;
  PlantSizeUnit: PlantSizeUnit;
  Query: ResolverTypeWrapper<{}>;
  SearchRecord: ResolverTypeWrapper<SearchRecord>;
  SearchRecordStatus: SearchRecordStatus;
  SortDirection: SortDirection;
  SortInput: SortInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  Int: Scalars['Int']['output'];
  PlantData: PlantData;
  PlantDataInput: PlantDataInput;
  PlantSize: PlantSize;
  PlantSizeInput: PlantSizeInput;
  Query: {};
  SearchRecord: SearchRecord;
  SortInput: SortInput;
  String: Scalars['String']['output'];
}>;

export type PlantDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantData'] = ResolversParentTypes['PlantData']> = ResolversObject<{
  addedTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bloomColors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  bloomTimes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  commonNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  habitat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hardiness?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  isPerennial?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lightLevels?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  maturityTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mediaUrls?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  occurrenceCoords?: Resolver<Array<Array<ResolversTypes['Float']>>, ParentType, ContextType>;
  occurrenceIds?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  scientificName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scrapeSources?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  soilTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  spread?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  updatedTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  uses?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantSizeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantSize'] = ResolversParentTypes['PlantSize']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['PlantSizeUnit']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  plants?: Resolver<Array<ResolversTypes['PlantData']>, ParentType, ContextType, Partial<QueryPlantsArgs>>;
  searchRecord?: Resolver<Maybe<ResolversTypes['SearchRecord']>, ParentType, ContextType, RequireFields<QuerySearchRecordArgs, 'id'>>;
}>;

export type SearchRecordResolvers<ContextType = any, ParentType extends ResolversParentTypes['SearchRecord'] = ResolversParentTypes['SearchRecord']> = ResolversObject<{
  endOfRecords?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  jsonStringSearch?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastAddedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SearchRecordStatus'], ParentType, ContextType>;
  totalOccurrences?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  uniqueOccurrences?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  PlantData?: PlantDataResolvers<ContextType>;
  PlantSize?: PlantSizeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SearchRecord?: SearchRecordResolvers<ContextType>;
}>;

