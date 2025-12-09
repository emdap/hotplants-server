import { JSDOM } from "jsdom";
import {
  getScrapeUrl,
  WebsiteScrapedDataWithSource,
} from "./util/scrapingUtil";

export const scrapePermaPeople = async (
  scientificName: string
): Promise<WebsiteScrapedDataWithSource | null> => {
  const scrapeUrl = getScrapeUrl(scientificName, "perma");
  const response = await fetch(scrapeUrl);

  if (response.status === 404) {
    return null;
  }

  const html = (await response.text()).toLowerCase();
  const document = new JSDOM(html).window.document;

  const thumbnailUrl = document
    .getElementsByClassName("layout-sidebar")?.[0]
    ?.getElementsByTagName("img")?.[0]?.src;

  return { scrapeSources: [scrapeUrl], source: "perma", thumbnailUrl };
};
