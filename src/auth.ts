import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "./config/mongodbClient.js";

export const trustedOrigins =
  process.env.NODE_ENV === "dev"
    ? ["http://localhost:5173"]
    : ["https://hotplants.fly.dev"];
const DB_NAME = process.env.NODE_ENV === "dev" ? "dev-auth" : "auth";
const authDb = client.db(DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(authDb),
  trustedOrigins,
  //  requireEmailVerification: true,

  emailAndPassword: {
    enabled: true,
  },
});
