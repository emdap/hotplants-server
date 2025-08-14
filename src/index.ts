import "dotenv/config";
import express from "express";
import {
  searchGbifPlants,
  storeGbifSearchResults,
} from "./gbif/gbif-plant-search";
import { operations } from "./gbif/schema/gbif";
import { lookupPlantByName } from "./internal-db/internal-plant-search";

const hostname = "127.0.0.1";
const port = 3000;

const app = express();
app.use(express.json());

app.get("/api/plants/:scientific_name", async ({ params, query }, res) => {
  const lowercaseName = params.scientific_name.toLowerCase();
  const overwrite = query.update === "true";

  const plantData = await lookupPlantByName(lowercaseName, overwrite);
  if (plantData) {
    res.json(plantData);
  } else {
    res.sendStatus(404);
  }

  return;
});

app.get(
  "/api/search",
  async (
    {
      query,
    }: {
      query: operations["searchOccurrence"]["parameters"]["query"] & {
        boundingBox: number[];
      };
    },
    res
  ) => {
    const gbifData = await searchGbifPlants(query);

    if (gbifData) {
      const plantData = await storeGbifSearchResults(gbifData);
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
