declare module "wkt" {
  export const stringify = (geoJson: import("geojson").GeoJsonObject) => string;
}
