import { JSDOM } from "jsdom";
import {
  GbifDataArrayKeys,
  GbifDataArrays,
  PartialPlantData,
} from "../config/types";
import { PlantSizeUnit } from "../graphql/graphql";

const PFAF_URL = "https://pfaf.org/user/Plant.aspx?LatinName=";

export type PfafScrapedData = Omit<PartialPlantData, GbifDataArrayKeys>;

const PLANT_FIELD_MAPPING: Record<string, keyof PfafScrapedData> = {
  "common name": "commonNames",
  "usda hardiness": "hardiness",
  habitats: "habitat",
  "bloom color": "bloomColors",
  "bloom time": "bloomTimes",
  "main bloom time": "bloomTimes",
};

/**
 *
 * Helper function to scrape plant data from PFAF
 *
 * @param scientificName The plant name to search for
 * @returns Data for the plant, with empty GBIF data array fields added
 */
export const scrapePlantByname = async (
  scientificName: string
): Promise<PartialPlantData & GbifDataArrays> => {
  const lowercaseName = scientificName.toLowerCase();

  const scrapedPlant = await scrapePFAF(lowercaseName);
  return {
    ...scrapedPlant,
    occurrenceCoords: [],
    occurrenceIds: [],
    mediaUrls: [],
  };
};

const cleanText = (text: string) =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const plantPageFound = (document: Document) => {
  const plantTitle = document.getElementById(
    "contentplaceholder1_lbldisplatinname"
  );
  return Boolean(plantTitle?.textContent);
};

const scrapeCareIcons = (document: Document) => {
  const careIconsTable = document.getElementById(
    "contentplaceholder1_tblicons"
  );
  if (!careIconsTable) {
    return;
  }

  const soilType: string[] = [];
  const lightLevel: string[] = [];
  const careIconTitles = Array.from(careIconsTable.querySelectorAll("img")).map(
    (imgElement) => imgElement.title
  );
  careIconTitles.forEach((title) => {
    if (title.match(/soil|water/g)) {
      soilType.push(title);
    } else if (title.match(/sun|shade/g)) {
      lightLevel.push(title);
    }
  });

  const plantData: Partial<PfafScrapedData> = {};
  if (soilType.length) plantData.soilTypes = soilType;
  if (lightLevel.length) plantData.lightLevels = lightLevel;

  return plantData;
};

const scrapeStructuredFields = (document: Document) => {
  const plantData: [string, unknown][] = [];
  const trElements = Array.from(document.querySelectorAll("tr"));

  trElements.forEach((element) => {
    const cells = element.querySelectorAll("td");
    const rowLabel = cells[0]?.textContent?.trim();
    const rowValue = cells[1]?.textContent?.trim();
    const plantKey = rowLabel ? PLANT_FIELD_MAPPING[rowLabel] : null;
    if (plantKey && rowValue) {
      if (plantKey === "hardiness") {
        plantData.push([
          plantKey,
          rowValue.split("-").map((item) => parseInt(item)),
        ]);
      } else {
        plantData.push([plantKey, rowValue.split(", ").map(cleanText)]);
      }
    }
  });

  return Object.fromEntries(plantData) as Partial<PfafScrapedData>;
};

const scrapePlantSummary = (document: Document) => {
  const plantData: [string, unknown][] = [];
  const plantSummary = document.getElementById(
    "contentplaceholder1_txtsummary"
  );

  plantSummary?.textContent?.split(".").forEach((item) => {
    const data = item.split(":");
    const plantKey = PLANT_FIELD_MAPPING[data[0].trim()];
    if (plantKey && data[1]) {
      plantData.push([plantKey, data[1].split(", ").map(cleanText)]);
    }
  });

  return Object.fromEntries(plantData) as Partial<PfafScrapedData>;
};

const extractPlantSize = (plantCharData: string) => {
  const plantSizeRegExp = /(\d+\.*\d*)+?\s*(m|cm)/g;
  const sizeMatches = Array.from(plantCharData.matchAll(plantSizeRegExp));
  const plantData: Pick<PfafScrapedData, "height" | "spread"> = {};

  if (sizeMatches.length === 2) {
    // Size data typically listed as "<height> by <spread>", get the first 2 numbers listed
    for (let i = 0; i < 2; i++) {
      const [_, amount, unit] = sizeMatches[i];
      plantData[i === 0 ? "height" : "spread"] = {
        amount: Number(amount),
        // TODO: Handle 'bad' unit
        unit: unit as PlantSizeUnit,
      };
    }
  }

  return plantData;
};

const scrapePlantPhysicalChars = (document: Document) => {
  let plantData: Partial<PfafScrapedData> = {};
  const plantCharData = document.getElementById(
    "contentplaceholder1_lblphystatment"
  )?.textContent;

  if (plantCharData) {
    plantData.physicalCharactersticsDump = plantCharData;
    plantData.isPerennial = plantCharData.indexOf("perennial") !== -1;
    plantData = { ...plantData, ...extractPlantSize(plantCharData) };
  }

  return plantData;
};

export const scrapePFAF = async (
  scientificName: string
): Promise<PfafScrapedData> => {
  const scrapeUrl = `${PFAF_URL}${scientificName.replace(/ /g, "+")}`;
  const response = await fetch(scrapeUrl);
  const html = (await response.text()).toLowerCase();

  const document = new JSDOM(html).window.document;

  if (!plantPageFound(document)) {
    return { scientificName, scrapeSources: [] };
  }

  const scrapedData: PfafScrapedData = {
    scientificName: scientificName,
    scrapeSources: [scrapeUrl],
    ...scrapeStructuredFields(document),
    ...scrapeCareIcons(document),
    ...scrapePlantSummary(document),
    ...scrapePlantPhysicalChars(document),
  };

  return scrapedData;
};
