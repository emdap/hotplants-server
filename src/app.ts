import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { apolloServer } from "./graphql";
import { RegisterRoutes } from "./routes";

const hostname = "127.0.0.1";
const port = 3000;

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (_req, res) =>
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
  console.info("i'm listening here");
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
  app.use("/graphql", express.json(), expressMiddleware(apolloServer));
};

startGraphQlServer();
