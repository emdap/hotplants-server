import { createHash } from "crypto";
import { ObjectId } from "mongodb";
import { plantCollection } from "../../config/mongodbClient";
import { MutationResolvers } from "../graphql";

export const replaceWithProxyUrlResolver: MutationResolvers["replaceWithProxyUrl"] =
  async (_, { plantId, occurrenceId, replaceUrl }) => {
    const plantData = await plantCollection.findOne(
      new ObjectId(plantId as string)
    );

    if (plantData) {
      const occurrenceIndex = plantData.occurrences.findIndex(
        (occurrence) => occurrence.occurrenceId === occurrenceId
      );

      if (occurrenceIndex === -1) {
        return null;
      }

      const mediaIndex = plantData.occurrences[occurrenceIndex].media.findIndex(
        ({ url }) => url === replaceUrl
      );
      if (mediaIndex === -1) {
        return null;
      }

      const { url } = plantData.occurrences[occurrenceIndex].media[mediaIndex];
      const md5Url = createHash("md5").update(url).digest("hex");
      const proxyUrl = `https://api.gbif.org/v1/image/cache/occurrence/${occurrenceId}/media/${md5Url}`;

      const { modifiedCount } = await plantCollection.updateOne(
        { _id: new ObjectId(plantId as string) },
        {
          $set: {
            [`mediaUrls.${mediaIndex}.url`]: proxyUrl,
            [`mediaUrls.${mediaIndex}.isProxyUrl`]: true,
          },
        }
      );

      return modifiedCount ? proxyUrl : null;
    }

    return null;
  };
