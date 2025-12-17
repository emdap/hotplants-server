import { BaseContext } from "@apollo/server";
import { User } from "better-auth";

export type ApolloContext = BaseContext & { user?: User };
