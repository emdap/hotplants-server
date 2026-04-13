import { Get, Route } from "tsoa";
import { plantArrayValuesCollection } from "../config/mongodbClient";
import { PlantArrayValuesDocument } from "../config/types";

@Route("/plants")
export class PlantsController {
  @Get("filterValues")
  public async getFilterValues(): Promise<PlantArrayValuesDocument> {
    const valuesDocument = await plantArrayValuesCollection.findOne({});
    if (valuesDocument) {
      const { _id, ...values } = valuesDocument;
      return values;
    }

    return {};
  }
}
