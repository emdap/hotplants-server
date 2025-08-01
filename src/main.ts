import "dotenv/config";
import { createServer } from "node:http";
import createClient from "openapi-fetch";
import { paths } from "./schemas/perenual";

const hostname = "127.0.0.1";
const port = 3000;

const perenualClient = createClient<paths>({
  baseUrl: "https://perenual.com/api/v2/",
});

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World");
});

server.listen(port, hostname, async () => {
  const key = process.env.PERENUAL_KEY!;
  console.log("running query");
  const { data: { data } = {} } = await perenualClient.GET("/species-list", {
    params: { query: { key, q: "ficus" } },
  });

  console.log(
    data?.map(({ id, species_epithet, common_name }) => [
      id,
      species_epithet,
      common_name,
    ])
  );

  console.log("running second query?", data?.[0]?.id);

  const species =
    data?.[0] &&
    (await perenualClient.GET("/species/details/{species_id}", {
      params: { path: { species_id: data[0].id! }, query: { key } },
    }));
  console.log(species?.data);
});
