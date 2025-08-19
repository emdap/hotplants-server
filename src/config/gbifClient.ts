import createClient from "openapi-fetch";
import { components, operations, paths } from "./schemas/gbif";

export const gbifClient = createClient<paths>({
  baseUrl: "https://api.gbif.org/v1/",
});

export type GbifOccurrenceSearchQuery =
  operations["searchOccurrence"]["parameters"]["query"];

export type GbifOccurenceResult = components["schemas"]["Occurrence"];
