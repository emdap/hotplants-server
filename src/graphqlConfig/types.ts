import { BaseContext } from "@apollo/server";

export type ApolloContext = BaseContext & { cookie?: string };
