import { userGardensCollection } from "@/config/mongodbClient";
import { GardenPlantRefDocument, UserGardenDocument } from "@/config/types";
import { User } from "better-auth";
import { GraphQLError } from "graphql";
import { Document, ObjectId } from "mongodb";
import {
  GardenPlantData,
  GardenPlantRef,
  MutationResolvers,
  QueryResolvers,
  UserGarden,
} from "../graphql";
import { ApolloContext } from "../types";
import { extractPlantFilter } from "./plantResolvers";
import {
  aggregateAndProject,
  caseInsensitiveStringRegex,
  paginateWithCount,
} from "./resolverUtils";

// TODO: Standard codes for FE to interpret error message from

const DEFAULT_GARDEN_NAME = (user: User) =>
  `${user.name.slice(0, 10)}'s Garden`;

const extractUser = (context: ApolloContext) => {
  if (!context.user) {
    throw new GraphQLError("Unauthorized", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  return context.user;
};

const userGardenMatch = (
  userId: string,
  {
    gardenName,
    gardenId,
  }: { gardenName?: string | null; gardenId?: string | null } = {},
) => ({
  $match: {
    userId,
    ...(gardenId
      ? { _id: new ObjectId(gardenId) }
      : gardenName && {
          gardenName: caseInsensitiveStringRegex(gardenName),
        }),
  },
});

export const allUserGardensResolver: QueryResolvers["allUserGardens"] = async (
  _,
  { gardenId, gardenName },
  context,
) => {
  const user = extractUser(context);
  return userGardensCollection
    .aggregate<UserGarden>([
      userGardenMatch(user.id, { gardenId, gardenName }),
      {
        $project: {
          gardenName: 1,
          gardenThumbnail: 1,
          plantRefs: 1,
          plantCount: { $size: "$plantRefs" },
        },
      },
    ])
    .toArray();
};

export const userGardenResolver: QueryResolvers["userGarden"] = async (
  _,
  { gardenId, gardenName },
  context,
  ...rest
) =>
  !gardenId && !gardenName
    ? null
    : (
        await allUserGardensResolver(
          _,
          { gardenId, gardenName },
          context,
          ...rest,
        )
      )[0];

export const userGardenPlantsResolver: QueryResolvers["userGardenPlants"] =
  async (_, { gardenId, where, ...args }, context) => {
    const user = extractUser(context);
    const pipeline: Document[] = [
      userGardenMatch(user.id, { gardenId }),

      { $unwind: "$plantRefs" },

      {
        $lookup: {
          from: "plantData",
          localField: "plantRefs._id",
          foreignField: "_id",
          as: "plantDataLookup",
        },
      },

      { $unwind: "$plantDataLookup" },

      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$plantDataLookup", "$plantRefs"],
          },
        },
      },
    ];

    where && pipeline.push({ $match: extractPlantFilter(where) });
    pipeline.push(paginateWithCount(args));

    return aggregateAndProject<UserGardenDocument, GardenPlantData>(
      userGardensCollection,
      pipeline,
    );
  };

export const newGardenResolver: MutationResolvers["newGarden"] = async (
  _,
  { gardenName },
  context,
) => {
  const user = extractUser(context);
  const newGardenName = gardenName?.trim() ?? DEFAULT_GARDEN_NAME(user);
  const existingGarden = await userGardensCollection.findOne({
    gardenName: newGardenName,
  });
  if (existingGarden) {
    throw new GraphQLError(`Duplicate garden name "${newGardenName}"`, {
      extensions: { code: 400 },
    });
  }

  const newGardenData = {
    _id: new ObjectId(),
    userId: user.id,
    gardenName: newGardenName,
    plantRefs: [] as GardenPlantRefDocument[],
    plantCount: 0,
  };

  const result = await userGardensCollection.insertOne(newGardenData);

  return result.acknowledged ? newGardenData : null;
};

export const addToGardenResolver: MutationResolvers["addToGarden"] = async (
  _,
  { gardenId, plantId },
  context,
) => {
  const user = extractUser(context);
  // TODO: Want to require gardenId in future -- FE not ready to specify, fallback to default name
  const existingGarden = await userGardensCollection.findOne(
    gardenId
      ? { _id: new ObjectId(gardenId) }
      : { gardenName: DEFAULT_GARDEN_NAME(user) },
  );

  if (
    existingGarden &&
    existingGarden.plantRefs.find(({ _id }) => _id.toString() === plantId)
  ) {
    throw new GraphQLError(
      `Plant already added to "${existingGarden?.gardenName}".`,
      {
        extensions: { code: 400 },
      },
    );
  }

  const newPlants: GardenPlantRef[] = (existingGarden?.plantRefs ?? []).concat({
    _id: new ObjectId(plantId),
    addedToGardenTimestamp: Date.now(),
  });

  return userGardensCollection.findOneAndUpdate(
    existingGarden?._id ? { _id: existingGarden._id } : {},
    {
      $set: {
        gardenName: existingGarden?.gardenName ?? DEFAULT_GARDEN_NAME(user),
        userId: user.id,
        plantRefs: newPlants,
        plantCount: existingGarden?.plantCount ?? 0,
      },
    },
    { returnDocument: "after", upsert: true },
  ) as Promise<UserGarden> | null;
};
