import { RESTDataSource } from "@apollo/datasource-rest";
import { Client } from "openapi-fetch";
import { paths } from "./gbif";

export class PlantsApi extends RESTDataSource {
  private plantClient: Client<paths>;

  constructor(client: Client<paths>) {
    super();
    this.plantClient = client;
  }

  async getPlants() {
    const { data } = await this.plantClient.GET("/occurrence/search");
    return data?.results;
  }
}
