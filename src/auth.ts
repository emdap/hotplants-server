import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "./config/mongodbClient.js";

const ENV_VARS = {
  dev: {
    trustedOrigins: ["http://localhost:5173", "http://localhost:8080"],
    baseURL: "http://localhost:4000",
    dbName: "dev-auth",
  },
  prod: {
    trustedOrigins: ["https://hotplants.fly.dev", "https://css-garden.fly.dev"],
    baseURL: "https://hotplants.fly.dev",
    dbName: "auth",
  },
};

export const { trustedOrigins, baseURL, dbName } =
  process.env.NODE_ENV === "dev" ? ENV_VARS.dev : ENV_VARS.prod;

const authDb = client.db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(authDb),
  baseURL,
  basePath: "/auth",

  trustedOrigins,
  //  requireEmailVerification: true,

  emailAndPassword: {
    enabled: true,
  },
});
