import { createHash } from "crypto";
import { ObjectId } from "mongodb";
import { plantCollection } from "../../config/mongodbClient";
import { MutationResolvers, PlantData } from "../graphql";

export const replaceWithProxyUrlResolver: MutationResolvers["replaceWithProxyUrl"] =
  async (_, { plantId, occurrenceId, replaceUrl }) => {
    const plantData = await plantCollection.findOne(
      new ObjectId(plantId as string)
    );

    if (plantData) {
      const { occurrenceIndex, mediaIndex } = getIndexes(
        plantData,
        occurrenceId,
        replaceUrl
      );
      if (occurrenceIndex === -1 || mediaIndex === -1) {
        return null;
      }

      const md5Url = createHash("md5").update(replaceUrl).digest("hex");
      const proxyUrl = `https://api.gbif.org/v1/image/cache/occurrence/${occurrenceId}/media/${md5Url}`;
      const updateKey = `occurrences.${occurrenceIndex}.media.${mediaIndex}`;

      const { modifiedCount } = await plantCollection.updateOne(
        { _id: new ObjectId(plantId as string) },
        {
          $set: {
            [`${updateKey}.url`]: proxyUrl,
            [`${updateKey}.isProxyUrl`]: true,
          },
        }
      );

      return modifiedCount ? proxyUrl : null;
    }

    return null;
  };

const getIndexes = (
  plantData: PlantData,
  occurrenceId: number,
  replaceUrl: string
) => {
  const occurrenceIndex = plantData.occurrences.findIndex(
    (occurrence) => occurrence.occurrenceId === occurrenceId
  );

  const mediaIndex =
    occurrenceIndex === -1
      ? -1
      : plantData.occurrences[occurrenceIndex].media.findIndex(
          ({ url }) => url === replaceUrl
        );

  return { occurrenceIndex, mediaIndex };
};
