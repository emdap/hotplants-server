import { userGardensCollection } from "@/config/mongodbClient";
import { GardenPlantDocument } from "@/config/types";
import { User } from "better-auth";
import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";
import { MutationResolvers, QueryResolvers, UserGarden } from "../graphql";
import { ApolloContext } from "../types";

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

export const userGardenResolver: QueryResolvers["userGarden"] = async (
  _,
  { gardenName },
  context
) => {
  const user = extractUser(context);

  const gardens = await joinGardensWithPlants(user.id, gardenName);
  return gardens[0];
};

export const allUserGardensResolver: QueryResolvers["allUserGardens"] = async (
  _,
  _params,
  context
) => {
  const user = extractUser(context);
  return joinGardensWithPlants(user.id);
};

export const newGardenResolver: MutationResolvers["newGarden"] = async (
  _,
  { gardenName },
  context
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
    totalPlants: 0,
    plantRefs: [],
  });

  return newGarden.insertedId;
};

export const addToGardenResolver: MutationResolvers["addToGarden"] = async (
  _,
  { gardenName, plantId },
  context
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
    throw new GraphQLError(`Plant already in garden ${newGardenName}`, {
      extensions: { code: 400 },
    });
  }

  const newPlants: GardenPlantDocument[] = (
    existingGarden?.plantRefs ?? []
  ).concat({
    _id: new ObjectId(plantId),
    addedToGardenTimestamp: Date.now(),
  });

  const updatedGarden = await userGardensCollection.findOneAndUpdate(
    { _id: existingGarden?._id },
    {
      $set: {
        gardenName: newGardenName,
        userId: user.id,
        plantRefs: newPlants,
      },
    },
    { returnDocument: "after" }
  );

  return updatedGarden?._id;
};

const joinGardensWithPlants = (userId: string, gardenName?: string) =>
  userGardensCollection
    .aggregate([
      {
        $match: {
          userId,
          ...(gardenName && {
            gardenName: { $regex: new RegExp(`^${gardenName?.trim()}$`, "i") },
          }),
        },
      },
      {
        $lookup: {
          from: "plantData",
          localField: "plantRefs._id",
          foreignField: "_id",
          as: "plantDataLookup",
        },
      },
      {
        $set: {
          plants: {
            $map: {
              input: "$plantRefs",
              as: "plantRef",
              in: {
                $mergeObjects: [
                  {
                    $first: {
                      $filter: {
                        input: "$plantDataLookup",
                        cond: { $eq: ["$$this._id", "$$plantRef._id"] },
                      },
                    },
                  },
                  {
                    addedToGardenTimestamp: "$$plantRef.addedToGardenTimestamp",
                    customThumbnailUrl: "$$plantRef.customThumbnailUrl",
                  },
                ],
              },
            },
          },
        },
      },
      {
        $set: {
          totalPlants: { $size: "$plants" },
        },
      },
      {
        $unset: ["plantDataLookup", "plantRefs"],
      },
    ])
    .toArray() as Promise<UserGarden[]>;
