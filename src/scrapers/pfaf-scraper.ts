import { JSDOM } from "jsdom";
import { plantCharacterstics, PlantData } from "../fixtures";

const PLANT_FIELD_MAPPING: Record<string, keyof PlantData> = {
  "common name": "common_name",
  "usda hardiness": "hardiness",
  habitats: "habitat",
  "bloom color": "bloom_color",
  "bloom time": "bloom_time",
  "main bloom time": "bloom_time",
};

const trimArrayItems = (array: string[]) => array.map((item) => item.trim());

const scrapeStructuredFields = (document: Document) => {
  const plantData = [];
  const trElements = Array.from(document.querySelectorAll("tr"));

  trElements.forEach((element) => {
    const cells = element.querySelectorAll("td");
    const rowLabel = cells[0]?.textContent.trim();
    const rowValue = cells[1]?.textContent.trim();
    const plantKey = PLANT_FIELD_MAPPING[rowLabel];
    if (plantKey && rowValue) {
      if (rowValue.includes(", ")) {
        plantData.push([plantKey, trimArrayItems(rowValue.split(", "))]);
      } else if (plantKey === "hardiness") {
        plantData.push([
          plantKey,
          rowValue.split("-").map((item) => parseInt(item)),
        ]);
      } else {
        plantData.push([plantKey, rowValue]);
      }
    }
  });

  return Object.fromEntries(plantData) as PlantData;
};

const extractPlantSummary = (document: Document) => {
  const plantData = [];
  const plantSummary = document.getElementById(
    "contentplaceholder1_txtsummary"
  );

  if (plantSummary) {
    const summaryItems = plantSummary.textContent.split(".");
    summaryItems.forEach((item) => {
      const data = item.split(":");
      const plantKey = PLANT_FIELD_MAPPING[data[0].trim()];
      if (plantKey && data[1]) {
        plantData.push([plantKey, trimArrayItems(data[1].split(", "))]);
      }
    });
  }

  return Object.fromEntries(plantData) as PlantData;
};

const extractPlantSize = (plantCharData: string) => {
  const plantSizeRegExp = /(\d+\.*\d*)+?\s*(m|cm)/g;
  const sizeMatches = Array.from(plantCharData.matchAll(plantSizeRegExp));
  const plantData: Pick<PlantData, "height" | "spread"> = {};

  if (sizeMatches.length === 2) {
    // Size data typically listed as "<height> by <spread>", get the first 2 numbers listed
    for (let i = 0; i < 2; i++) {
      const [_, amount, unit] = sizeMatches[i];
      plantData[i === 0 ? "height" : "spread"] = {
        amount: Number(amount),
        unit,
      };
    }
  }

  return plantData;
};

const extractPlantPhysicalChars = (document: Document) => {
  let plantData: Partial<PlantData> = {};
  const plantCharData = document.getElementById(
    "contentplaceholder1_lblphystatment"
  )?.textContent;

  if (plantCharData) {
    plantData.is_perennial = plantCharData.indexOf("perennial") !== -1;
    console.log(plantCharData);
    plantData = { ...plantData, ...extractPlantSize(plantCharData) };
  }

  return plantData;
};

const scrapePFAF = async (scientificName: string): Promise<PlantData> => {
  const baseUrl = "https://pfaf.org/user/Plant.aspx?LatinName=";

  const response = await fetch(
    `${baseUrl}${scientificName.replace(/ /g, "+")}`
  );
  const html = (await response.text()).toLowerCase();

  const document = new JSDOM(html).window.document;

  const scrapedData: PlantData = {
    scientific_name: scientificName,
    ...scrapeStructuredFields(document),
    ...extractPlantSummary(document),
    ...extractPlantPhysicalChars(document),
  };

  return scrapedData;
};

export const getPlantCharacteristics = async (
  scientificName: string,
  overwrite?: boolean
): Promise<PlantData> => {
  const lowercaseName = scientificName.toLowerCase();
  const existingPlantQuery = { scientific_name: lowercaseName };
  const existingData = await plantCharacterstics.findOne(existingPlantQuery);

  if (existingData && !overwrite) {
    const { _id, ...plantData } = existingData;
    return plantData;
  }

  const scrapedData = await scrapePFAF(lowercaseName);
  if (existingData) {
    await plantCharacterstics.updateOne(existingPlantQuery, scrapedData);
  } else {
    await plantCharacterstics.insertOne(scrapedData);
  }
  return scrapedData;
};
