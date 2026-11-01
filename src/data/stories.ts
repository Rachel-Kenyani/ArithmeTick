/**
 * The adventure, one story stop per level: Brijo asks for help ("The monkeys dropped the mangoes!"), the
 * puzzle is the help. Puzzle stops are missions, not rewards: the start names the job ("Put 6 mangoes back"),
 * the end shows it done for Brijo ("All 6 mangoes are back in the basket!") and Brijo says thank you, so the
 * story closes. Move & Play stops find a single treasure for the child. Copy is child-facing: one short line
 * that matches the recording, no instructions (the board and the voice of the puzzle do that).
 */

import type { CounterItem } from "@/features/play/components/CounterFace";
import type { LevelDef } from "@/data/levels";
import type { Grade } from "@/types/domain";

export interface StoryStop {
  /** Brijo's line at the start, word for word as recorded (docs/voice), so no child's name. */
  ask: string;
  /** What the child counts with on the board, and what the celebration shows. */
  treasure: CounterItem;
  /** "a mango" — a single treasure (Move & Play). */
  one: string;
  /** "mangoes" — the counted treasures. */
  many: string;
  /** The job, shown on the story card: "Put 6 mangoes back". */
  mission: (count: number) => string;
  /** The job done, shown on the celebration: "All 6 mangoes are back in the basket!". */
  done: (count: number) => string;
}

const STORIES: Record<Grade, readonly StoryStop[]> = {
  1: [
    {
      ask: "Brijo is collecting bottle tops for a game! Can you fill the white board with six bottle tops?",
      treasure: "cap",
      one: "a bottle top",
      many: "bottle tops",
      mission: (c) => `Collect ${c} bottle tops`,
      done: (c) => `All ${c} bottle tops are ready for the game!`,
    },
    {
      ask: "The wind blew away seven feathers. Help Brijo collect them!",
      treasure: "feather",
      one: "a feather",
      many: "feathers",
      mission: (c) => `Collect ${c} feathers`,
      done: (c) => `All ${c} feathers are back in Brijo's nest!`,
    },
    {
      ask: "Time to move! Brijo wants to see real groups.",
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found a shiny pebble for Brijo!`,
    },
    {
      ask: "The river washed up eight shells. Let's collect all of them and put them on the white board!",
      treasure: "shell",
      one: "a shell",
      many: "shells",
      mission: (c) => `Line up ${c} shells`,
      done: (c) => `All ${c} shells are lined up on the sand!`,
    },
    {
      ask: "Brijo had seven bottle tops and put two in her basket! How many bottle tops are left?",
      treasure: "cap",
      one: "a bottle top",
      many: "bottle tops",
      mission: () => `Count the bottle tops left`,
      done: (c) => `${c} bottle tops left to play with!`,
    },
    {
      ask: "Time to move! Brijo wants to see real groups.",
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found a shiny pebble for Brijo!`,
    },
    {
      ask: "Brijo wants to plant nine flowers. Can you help?",
      treasure: "flower",
      one: "a flower",
      many: "flowers",
      mission: (c) => `Plant ${c} flowers`,
      done: (c) => `All ${c} flowers are planted!`,
    },
    {
      ask: "Nine tomatoes grow in the garden. Brijo picks four tomatoes for soup! How many tomatoes are left?",
      treasure: "tomato",
      one: "a tomato",
      many: "tomatoes",
      mission: () => `Count the tomatoes left`,
      done: (c) => `${c} tomatoes still growing!`,
    },
    {
      ask: "This is the last stop! Show a grown-up and finish the adventure.",
      treasure: "nest",
      one: "Brijo's nest",
      many: "nests",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found Brijo's nest!`,
    },
  ],
  2: [
    {
      ask: "Brijo's garden grew thirty-four tomatoes! How many tomatoes make full crates of ten? How many are left?",
      treasure: "tomato",
      one: "a tomato",
      many: "tomatoes",
      mission: () => `Fill frames of 10`,
      done: () => `Thirty-four tomatoes: three full frames and four left over!`,
    },
    {
      ask: "Brijo is counting her mangoes backwards from fifty. Can you fill in the missing numbers?",
      treasure: "mango",
      one: "a mango",
      many: "mangoes",
      mission: () => `Count back from 50`,
      done: () => `You counted all the way back from fifty!`,
    },
    {
      ask: "Time to move! How many handspans long is your table?",
      treasure: "leaf",
      one: "a big leaf",
      many: "leaves",
      mission: () => `Measure with your hands`,
      done: () => `You measured it with your hands!`,
    },
    {
      ask: "Brijo picked twenty-seven tomatoes, then five more. How many tomatoes does she have now?",
      treasure: "tomato",
      one: "a tomato",
      many: "tomatoes",
      mission: () => `Add 5 and make a ten`,
      done: () => `Thirty-two tomatoes for the market!`,
    },
    {
      ask: "Brijo had thirty-two oranges and gave seven to the monkeys. How many oranges are left?",
      treasure: "orange",
      one: "an orange",
      many: "oranges",
      mission: () => `Take away 7`,
      done: () => `Twenty-five oranges left for Brijo!`,
    },
    {
      ask: "Time to move! Find something heavy, something light, and see how many cups fill a jug.",
      treasure: "shell",
      one: "a shell",
      many: "shells",
      mission: () => `Heavy, light and full`,
      done: () => `You found out what is heavy and what is full!`,
    },
    {
      ask: "Brijo puts two seeds in each hole. There are three holes. How many seeds does she need?",
      treasure: "seed",
      one: "a seed",
      many: "seeds",
      mission: () => `3 groups of 2`,
      done: () => `Six seeds, two in every hole!`,
    },
    {
      ask: "Two monkeys want to share eight tomatoes fairly. Give each monkey half!",
      treasure: "tomato",
      one: "a tomato",
      many: "tomatoes",
      mission: () => `Share 8 in half`,
      done: () => `Four tomatoes each, a fair half!`,
    },
    {
      ask: "It's market day! Pay for something with shillings, together with a grown-up.",
      treasure: "drum",
      one: "a little drum",
      many: "drums",
      mission: () => `Pay with shillings`,
      done: () => `You paid with shillings like a real shopper!`,
    },
    {
      ask: "Forty-five flowers grew in the garden. Brijo picked eighteen for her nest. How many flowers are left?",
      treasure: "flower",
      one: "a flower",
      many: "flowers",
      mission: () => `Take away 18`,
      done: () => `Twenty-seven flowers still growing!`,
    },
    {
      ask: "Brijo's friends are coming at three o'clock. Can you set the clock?",
      treasure: "star",
      one: "a golden star",
      many: "stars",
      mission: () => `Set the clock`,
      done: () => `Three o'clock, just in time!`,
    },
    {
      ask: "This is the last stop! Find shapes and lines around you and show a grown-up.",
      treasure: "nest",
      one: "Brijo's nest",
      many: "nests",
      mission: () => `Find shapes and lines`,
      done: () => `You found Brijo's nest!`,
    },
  ],
  3: [
    {
      ask: "Brijo is building a treehouse. Lay out the planks!",
      treasure: "leaf",
      one: "a big leaf",
      many: "leaves",
      mission: (c) => `Lay out the planks`,
      done: (c) => `The treehouse floor is ready!`,
    },
    {
      ask: "Plant the garden in neat rows!",
      treasure: "seed",
      one: "a seed",
      many: "seeds",
      mission: (c) => `Plant the seeds in rows`,
      done: (c) => `The seeds are in neat rows!`,
    },
    {
      ask: "Time to move! Brijo wants to see real groups.",
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found a shiny pebble for Brijo!`,
    },
    {
      ask: "Stack the mangoes in rows for market day!",
      treasure: "mango",
      one: "a mango",
      many: "mangoes",
      mission: (c) => `Stack ${c} mangoes`,
      done: (c) => `${c} mangoes stacked for market day!`,
    },
    {
      ask: "Bundle the sticks into tens!",
      treasure: "drum",
      one: "a little drum",
      many: "drums",
      mission: (c) => `Bundle the sticks`,
      done: (c) => `The sticks are bundled into a ten!`,
    },
    {
      ask: "This is the last stop! Show a grown-up and finish the adventure.",
      treasure: "star",
      one: "a golden star",
      many: "stars",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found a golden star for Brijo!`,
    },
  ],
};

/** How many treasures a level brings back: the number the child built (1 for Move & Play). */
export function treasureCount(level: LevelDef): number {
  if (level.kind === "quest") return 1;
  switch (level.grade) {
    case 1:
      return level.game === "takeAway"
        ? level.puzzle.start - level.puzzle.away
        : level.puzzle.target;
    case 2: {
      if (level.game !== "placeValue") return 1;
      const { op, a, b } = level.puzzle;
      return op === "add" ? a + b : op === "sub" ? a - b : a;
    }
    case 3:
      return level.puzzle.rows * level.puzzle.cols;
  }
}

/**
 * What the story card draws and says in big type (≤ 8 words): how many items, and for take-away levels how
 * many Brijo takes. The full sentence is spoken, not read.
 */
export interface StoryScene {
  items: number;
  away: number;
  caption: string;
}

export function sceneFor(story: StoryStop, level: LevelDef): StoryScene {
  if (
    level.kind === "puzzle" &&
    level.grade === 1 &&
    level.game === "takeAway"
  ) {
    const { start, away } = level.puzzle;
    return {
      items: start,
      away,
      caption: `${start} ${story.many}. Brijo takes ${away}.`,
    };
  }
  const n = treasureCount(level);
  // Grade 2 numbers run past 30: too many to draw, so the caption carries the story alone.
  return {
    items: level.grade === 2 ? 0 : n,
    away: 0,
    caption: story.mission(n),
  };
}

export function storyFor(grade: Grade, level: number): StoryStop | null {
  return STORIES[grade][level - 1] ?? null;
}
