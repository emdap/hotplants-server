import "dotenv/config";
import express from "express";
import { GbifOccurrenceSearchQuery } from "./gbif/gbif-config";
import {
  searchGbifPlants,
  storeCompletedGbifPlants,
} from "./gbif/gbif-plant-search";
import { lookupPlantByName } from "./internal-db/internal-plant-util";

const hostname = "127.0.0.1";
const port = 3000;

const app = express();
app.use(express.json());

// TODO: This endpoint was for testing, but I don't think has a solid usecase in actual
// app flow
app.get("/api/plants/:scientificName", async ({ params, query }, res) => {
  const lowercaseName = params.scientificName.toLowerCase();
  // const overwrite = query.update === "true";

  const plantData = await lookupPlantByName(lowercaseName);
  if (plantData) {
    res.json(plantData);
    return;
  }

  res.sendStatus(404);
  return;
});

app.get(
  "/api/search",
  async ({ query }: { query: GbifOccurrenceSearchQuery }, res) => {
    const gbifData = await searchGbifPlants(query);

    if (gbifData) {
      const plantData = await storeCompletedGbifPlants(gbifData);

      if (plantData) {
        res.json(plantData);
        return;
      }
    }

    res.sendStatus(404);
    return;
  }
);

app.listen(port, hostname, async () => {
  console.log("i'm listening here");
});
