/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = "plants";

use(database);

const plantData = db.getCollection("plantData");

plantData.aggregate([
  {
    $group: {
      _id: null,
      bloomColors: { $push: "$bloomColors" },
      bloomTimes: { $push: "$bloomTimes" },
      hardiness: { $push: "$hardiness" },
      lightLevels: { $push: "$lightLevels" },
      soilTypes: { $push: "$soilTypes" },
      uses: { $push: "$uses" },
    },
  },
  {
    $project: {
      _id: 0,
      bloomColors: {
        $setUnion: {
          $reduce: {
            input: "$bloomColors",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
      bloomTimes: {
        $setUnion: {
          $reduce: {
            input: "$bloomTimes",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
      hardiness: {
        $setUnion: {
          $reduce: {
            input: "$hardiness",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
      lightLevels: {
        $setUnion: {
          $reduce: {
            input: "$lightLevels",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
      soilTypes: {
        $setUnion: {
          $reduce: {
            input: "$soilTypes",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  },
  { $out: "plantArrayValues" },
]);
