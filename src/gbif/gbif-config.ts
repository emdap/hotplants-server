import createClient from "openapi-fetch";
import { components, operations, paths } from "./schema/gbif";

export const gbifClient = createClient<paths>({
  baseUrl: "https://api.gbif.org/v1/",
});

// Force the types to not be undefined using `object &`
export type GbifOccurrenceSearchQuery = object &
  operations["searchOccurrence"]["parameters"]["query"];

export type GbifOccurenceResult = (object &
  components["schemas"]["SearchResponseOccurrenceOccurrenceSearchParameter"]["results"])[number];
