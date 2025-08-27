import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
};

export type PlantData = {
  __typename?: 'PlantData';
  bloomColors?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  bloomTimes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  commonNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  habitat?: Maybe<Scalars['String']['output']>;
  hardiness?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  height?: Maybe<PlantSize>;
  isPerennial?: Maybe<Scalars['Boolean']['output']>;
  lightLevels?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  maturityTime?: Maybe<Scalars['String']['output']>;
  scientificName: Scalars['String']['output'];
  soilTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  spread?: Maybe<PlantSize>;
  uses?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type PlantSize = {
  __typename?: 'PlantSize';
  amount?: Maybe<Scalars['Int']['output']>;
  unit?: Maybe<PlantSizeUnit>;
};

export enum PlantSizeUnit {
  Cm = 'cm',
  Ft = 'ft',
  In = 'in',
  M = 'm'
}

export type Query = {
  __typename?: 'Query';
  plants?: Maybe<Array<Maybe<PlantData>>>;
};


export type QueryPlantsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Scalars['JSON']['input']>;
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
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  PlantData: ResolverTypeWrapper<PlantData>;
  PlantSize: ResolverTypeWrapper<PlantSize>;
  PlantSizeUnit: PlantSizeUnit;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  PlantData: PlantData;
  PlantSize: PlantSize;
  Query: {};
  String: Scalars['String']['output'];
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type PlantDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantData'] = ResolversParentTypes['PlantData']> = ResolversObject<{
  bloomColors?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  bloomTimes?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  commonNames?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  habitat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hardiness?: Resolver<Maybe<Array<Maybe<ResolversTypes['Int']>>>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  isPerennial?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lightLevels?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  maturityTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scientificName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  soilTypes?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  spread?: Resolver<Maybe<ResolversTypes['PlantSize']>, ParentType, ContextType>;
  uses?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlantSizeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlantSize'] = ResolversParentTypes['PlantSize']> = ResolversObject<{
  amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['PlantSizeUnit']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  plants?: Resolver<Maybe<Array<Maybe<ResolversTypes['PlantData']>>>, ParentType, ContextType, Partial<QueryPlantsArgs>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  JSON?: GraphQLScalarType;
  PlantData?: PlantDataResolvers<ContextType>;
  PlantSize?: PlantSizeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

