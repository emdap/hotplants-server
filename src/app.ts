import { apolloServer } from "@/graphqlConfig/serverConfig";
import { RegisterRoutes } from "@/routes";
import { expressMiddleware } from "@as-integrations/express5";
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { auth, trustedOrigins } from "./auth";

const hostname = "0.0.0.0";
const port = 3000;

const app = express();
app.use(
  cors({
    origin: trustedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (_req, res) =>
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

const router = express.Router();
RegisterRoutes(router);
app.use("/api", router);

app.listen(port, hostname, async () => {
  console.info("send plants", hostname, port);
});

app.use(
  "/api/swagger",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

const startGraphQlServer = async () => {
  await apolloServer.start();
  app.use(
    "/graphql",
    express.json(),
    cookieParser(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        const session = await auth.api.getSession({
          headers: req.headers as HeadersInit,
        });
        return { req, res, user: session?.user };
      },
    })
  );
};

startGraphQlServer();
