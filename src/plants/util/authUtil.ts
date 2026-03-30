import { auth } from "@/auth";
import { GraphQLError } from "graphql";

export const extractUserFromCookie = async (cookie?: string) => {
  const session = cookie
    ? await auth.api.getSession({
        headers: { cookie },
      })
    : null;

  return session?.user;
};

const unauthorizedError = () =>
  new GraphQLError("Unauthorized", {
    extensions: {
      code: "UNAUTHENTICATED",
      http: { status: 401 },
    },
  });

export const validateCookie = async (cookie?: string) => {
  if (!cookie) {
    throw unauthorizedError();
  }

  const user = await extractUserFromCookie(cookie);

  if (!user) {
    throw unauthorizedError();
  }

  return user;
};
