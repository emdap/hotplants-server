import createClient from "openapi-fetch";
import { components, operations, paths } from "./schemas/gbif";

export const gbifClient = createClient<paths>({
  baseUrl: "https://api.gbif.org/v1/",
});

export type GbifOccurrenceSearchParams = Omit<
  Required<operations["searchOccurrence"]["parameters"]>["query"],
  "q"
>;

export type GbifOccurenceResult = components["schemas"]["Occurrence"];

export type GbifOccurrenceSearchResponse =
  components["schemas"]["SearchResponseOccurrenceOccurrenceSearchParameter"];
