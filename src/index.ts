import "dotenv/config";
import express from "express";
import { getPlantCharacteristics } from "./scrapers/pfaf-scraper";

const hostname = "127.0.0.1";
const port = 3000;

const app = express();
app.use(express.json());

app.get("/api/plants/:scientific_name", async ({ params }, res) => {
  const plantCharacterstics = await getPlantCharacteristics(
    params.scientific_name
  );
  res.json(plantCharacterstics);
});

app.get("/api/plants/update/:scientific_name", async ({ params }, res) => {
  const plantCharacterstics = await getPlantCharacteristics(
    params.scientific_name,
    true
  );
  res.json(plantCharacterstics);
});

// const gbifClient = createClient<paths>({
//   baseUrl: "https://perenual.com/api/v2/",
// });

app.listen(port, hostname, async () => {
  console.log("i'm listening here");
});
