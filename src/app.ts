import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes";

const hostname = "127.0.0.1";
const port = 3000;

const app = express();
app.use(express.json());
app.use(express.static("public"));

RegisterRoutes(app);

app.listen(port, hostname, async () => {
  console.info("i'm listening here");
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);
