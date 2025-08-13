import "dotenv/config";
import express from "express";
import { getPlantByName } from "./util/plant-searching";

const hostname = "127.0.0.1";
const port = 3000;

const app = express();
app.use(express.json());

app.get("/api/plants/:scientific_name", async ({ params, query }, res) => {
  const lowercaseName = params.scientific_name.toLowerCase();
  const overwrite = query.update === "true";

  const plantData = await getPlantByName(lowercaseName, overwrite);
  if (plantData) {
    res.json(plantData);
  } else {
    res.sendStatus(404);
  }
  return;
});

app.listen(port, hostname, async () => {
  console.log("i'm listening here");
});
