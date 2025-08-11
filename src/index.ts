import "dotenv/config";
import express from "express";
import { getPlantCharacteristics } from "./scrapers/pfaf-scraper";

const hostname = "127.0.0.1";
const port = 3000;

const app = express();
app.use(express.json());

app.get("/api/plants/:scientific_name", async ({ params, query }, res) => {
  const plantCharacterstics = await getPlantCharacteristics(
    params.scientific_name,
    !!query["update"]
  );

  if (!plantCharacterstics) {
    res.status(404);
  }

  res.json(plantCharacterstics);
});

app.listen(port, hostname, async () => {
  console.log("i'm listening here");
});
