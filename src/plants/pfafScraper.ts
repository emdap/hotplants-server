import { JSDOM } from "jsdom";
import { PlantDataDocument } from "../config/types";
import { PlantSizeUnit } from "../graphql/types";

const PFAF_URL = "https://pfaf.org/user/Plant.aspx?LatinName=";

const PLANT_FIELD_MAPPING: Record<string, keyof PlantDataDocument> = {
  "common name": "commonNames",
  "usda hardiness": "hardiness",
  habitats: "habitat",
  "bloom color": "bloomColors",
  "bloom time": "bloomTimes",
  "main bloom time": "bloomTimes",
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

  const plantData: Partial<PlantDataDocument> = {};
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
      if (rowValue.includes(", ")) {
        plantData.push([plantKey, rowValue.split(", ").map(cleanText)]);
      } else if (plantKey === "hardiness") {
        plantData.push([
          plantKey,
          rowValue.split("-").map((item) => parseInt(item)),
        ]);
      } else {
        plantData.push([plantKey, cleanText(rowValue)]);
      }
    }
  });

  return Object.fromEntries(plantData) as Partial<PlantDataDocument>;
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

  return Object.fromEntries(plantData) as Partial<PlantDataDocument>;
};

const extractPlantSize = (plantCharData: string) => {
  const plantSizeRegExp = /(\d+\.*\d*)+?\s*(m|cm)/g;
  const sizeMatches = Array.from(plantCharData.matchAll(plantSizeRegExp));
  const plantData: Pick<PlantDataDocument, "height" | "spread"> = {};

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
  let plantData: Partial<PlantDataDocument> = {};
  const plantCharData = document.getElementById(
    "contentplaceholder1_lblphystatment"
  )?.textContent;

  if (plantCharData) {
    plantData.isPerennial = plantCharData.indexOf("perennial") !== -1;
    plantData = { ...plantData, ...extractPlantSize(plantCharData) };
  }

  return plantData;
};

export const scrapePFAF = async (
  scientificName: string
): Promise<PlantDataDocument> => {
  const scrapeUrl = `${PFAF_URL}${scientificName.replace(/ /g, "+")}`;
  const response = await fetch(scrapeUrl);
  const html = (await response.text()).toLowerCase();

  const document = new JSDOM(html).window.document;

  if (!plantPageFound(document)) {
    return { scientificName };
  }

  const scrapedData: PlantDataDocument = {
    scientificName: scientificName,
    scrapeSources: [scrapeUrl],
    ...scrapeStructuredFields(document),
    ...scrapeCareIcons(document),
    ...scrapePlantSummary(document),
    ...scrapePlantPhysicalChars(document),
  };

  return scrapedData;
};
