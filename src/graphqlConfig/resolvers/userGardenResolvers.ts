import { userGardensCollection } from "@/config/mongodbClient";
import { GardenPlantRefDocument, UserGardenDocument } from "@/config/types";
import { User } from "better-auth";
import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";
import {
  AddToGardenResult,
  GardenPlantData,
  GardenPlantRef,
  MutationResolvers,
  QueryResolvers,
  UserGarden,
} from "../graphql";
import { ApolloContext } from "../types";
import { aggregateAndProject, paginateWithCount } from "./resolverUtils";

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

const userGardenMatch = (userId: string, gardenName?: string) => ({
  $match: {
    userId,
    ...(gardenName && {
      gardenName: { $regex: new RegExp(`^${gardenName?.trim()}$`, "i") },
    }),
  },
});

export const allUserGardensResolver: QueryResolvers["allUserGardens"] = async (
  _,
  { gardenName }: { gardenName?: string },
  context,
) => {
  const user = extractUser(context);
  return userGardensCollection
    .aggregate<UserGarden>([
      userGardenMatch(user.id, gardenName),
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
  { gardenName },
  context,
  ...rest
) => (await allUserGardensResolver(_, { gardenName }, context, ...rest))[0];

export const userGardenPlantsResolver: QueryResolvers["userGardenPlants"] =
  async (_, { gardenName, ...args }, context) => {
    const user = extractUser(context);

    return aggregateAndProject<UserGardenDocument, GardenPlantData>(
      userGardensCollection,
      [
        userGardenMatch(user.id, gardenName),

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

        paginateWithCount(args),
      ],
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
    throw new GraphQLError("Duplicate garden name", {
      extensions: { code: 400 },
    });
  }

  const newGarden = await userGardensCollection.insertOne({
    userId: user.id,
    gardenName: gardenName?.trim() ?? DEFAULT_GARDEN_NAME(user),
    plantRefs: [] as GardenPlantRefDocument[],
    plantCount: 0,
  });

  return newGarden.insertedId;
};

export const addToGardenResolver: MutationResolvers["addToGarden"] = async (
  _,
  { gardenName, plantId },
  context,
) => {
  const user = extractUser(context);
  const newGardenName = gardenName?.trim() ?? DEFAULT_GARDEN_NAME(user);
  const existingGarden = await userGardensCollection.findOne({
    gardenName: newGardenName,
  });

  if (
    existingGarden &&
    existingGarden.plantRefs.find(({ _id }) => _id.toString() === plantId)
  ) {
    throw new GraphQLError(`Plant already added to "${newGardenName}".`, {
      extensions: { code: 400 },
    });
  }

  const newPlants: GardenPlantRef[] = (existingGarden?.plantRefs ?? []).concat({
    _id: new ObjectId(plantId),
    addedToGardenTimestamp: Date.now(),
  });

  return userGardensCollection.findOneAndUpdate(
    existingGarden?._id ? { _id: existingGarden._id } : {},
    {
      $set: {
        gardenName: newGardenName,
        userId: user.id,
        plantRefs: newPlants,
      },
    },
    { returnDocument: "after", upsert: true },
  ) as Promise<AddToGardenResult> | null;
};
