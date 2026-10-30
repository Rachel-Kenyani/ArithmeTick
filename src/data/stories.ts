/**
 * The adventure, one story stop per level: Brijo asks for help ("The monkeys dropped the mangoes!"), the
 * puzzle is the help. Puzzle stops are missions, not rewards: the start names the job ("Put 6 mangoes back"),
 * the end shows it done for Brijo ("All 6 mangoes are back in the basket!") and Brijo says thank you, so the
 * story closes. Move & Play stops find a single treasure for the child. Copy is child-facing: one short line,
 * the child's name up front, no instructions (the board and the voice of the puzzle do that).
 */

import type { CounterItem } from "@/features/play/components/CounterFace";
import type { LevelDef } from "@/data/levels";
import type { Grade } from "@/types/domain";

export interface StoryStop {
  /** Brijo's line at the start: `name` is the child's name. */
  ask: (name: string) => string;
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
      ask: (n) =>
        `${n}, Brijo is collecting bottle tops for a game! Can you fill the white board with 6 bottle tops?`,
      treasure: "cap",
      one: "a bottle top",
      many: "bottle tops",
      mission: (c) => `Collect ${c} bottle tops`,
      done: (c) => `All ${c} bottle tops are ready for the game!`,
    },
    {
      ask: (n) =>
        `${n}, the wind blew away 7 feathers. Help Brijo collect them!`,
      treasure: "feather",
      one: "a feather",
      many: "feathers",
      mission: (c) => `Collect ${c} feathers`,
      done: (c) => `All ${c} feathers are back in Brijo's nest!`,
    },
    {
      ask: (n) => `Time to move, ${n}! Brijo wants to see real groups.`,
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found a shiny pebble for Brijo!`,
    },
    {
      ask: (n) =>
        `${n}, the river washed up 8 shells. Let's collect all of them and put them on the white board!`,
      treasure: "shell",
      one: "a shell",
      many: "shells",
      mission: (c) => `Line up ${c} shells`,
      done: (c) => `All ${c} shells are lined up on the sand!`,
    },
    {
      ask: (n) =>
        `${n}, Brijo had 7 bottle tops and put 2 in her basket! How many bottle tops are left?`,
      treasure: "cap",
      one: "a bottle top",
      many: "bottle tops",
      mission: () => `Put 2 in the basket, count the rest`,
      done: (c) => `${c} bottle tops left to play with!`,
    },
    {
      ask: (n) => `Time to move, ${n}! Brijo wants to see real groups.`,
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found a shiny pebble for Brijo!`,
    },
    {
      ask: (n) => `Brijo wants to plant 9 flowers, ${n}. Can you help?`,
      treasure: "flower",
      one: "a flower",
      many: "flowers",
      mission: (c) => `Plant ${c} flowers`,
      done: (c) => `All ${c} flowers are planted!`,
    },
    {
      ask: (n) =>
        `${n}, 9 tomatoes grow in the garden. Brijo picks 4 tomatoes for soup! How many tomatoes are left?`,
      treasure: "tomato",
      one: "a tomato",
      many: "tomatoes",
      mission: () => `Pick 4 in the basket, count the rest`,
      done: (c) => `${c} tomatoes still growing!`,
    },
    {
      ask: (n) => `This is the last stop, ${n}! Show a grown-up and finish the adventure.`,
      treasure: "nest",
      one: "Brijo's nest",
      many: "nests",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found Brijo's nest!`,
    },
  ],
  2: [
    {
      ask: (n) => `${n}, the elephant's scale won't balance! Can you fix it?`,
      treasure: "banana",
      one: "a banana",
      many: "bananas",
      mission: (c) => `Balance the scale`,
      done: (c) => `The scale is balanced!`,
    },
    {
      ask: (n) => `Help the monkeys share their oranges fairly, ${n}!`,
      treasure: "orange",
      one: "an orange",
      many: "oranges",
      mission: (c) => `Share the oranges`,
      done: (c) => `The oranges are shared fairly!`,
    },
    {
      ask: (n) => `Time to move, ${n}! Brijo wants to see real groups.`,
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found a shiny pebble for Brijo!`,
    },
    {
      ask: (n) => `${n}, the market scale is wobbly. Balance it!`,
      treasure: "seed",
      one: "a seed",
      many: "seeds",
      mission: (c) => `Plant the seeds in rows`,
      done: (c) => `The seeds are in neat rows!`,
    },
    {
      ask: (n) => `The drums need tuning, ${n}. Make both sides match!`,
      treasure: "drum",
      one: "a little drum",
      many: "drums",
      mission: (c) => `Tune the drums`,
      done: (c) => `The drums are all tuned up!`,
    },
    {
      ask: (n) => `This is the last stop, ${n}! Show a grown-up and finish the adventure.`,
      treasure: "nest",
      one: "Brijo's nest",
      many: "nests",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found Brijo's nest!`,
    },
  ],
  3: [
    {
      ask: (n) => `${n}, Brijo is building a treehouse. Lay out the planks!`,
      treasure: "leaf",
      one: "a big leaf",
      many: "leaves",
      mission: (c) => `Lay out the planks`,
      done: (c) => `The treehouse floor is ready!`,
    },
    {
      ask: (n) => `Plant the garden in neat rows, ${n}!`,
      treasure: "seed",
      one: "a seed",
      many: "seeds",
      mission: (c) => `Plant the seeds in rows`,
      done: (c) => `The seeds are in neat rows!`,
    },
    {
      ask: (n) => `Time to move, ${n}! Brijo wants to see real groups.`,
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: (c) => `Find a treasure`,
      done: (c) => `You found a shiny pebble for Brijo!`,
    },
    {
      ask: (n) => `${n}, stack the mangoes in rows for market day!`,
      treasure: "mango",
      one: "a mango",
      many: "mangoes",
      mission: (c) => `Stack ${c} mangoes`,
      done: (c) => `${c} mangoes stacked for market day!`,
    },
    {
      ask: (n) => `Bundle the sticks into tens, ${n}!`,
      treasure: "drum",
      one: "a little drum",
      many: "drums",
      mission: (c) => `Bundle the sticks`,
      done: (c) => `The sticks are bundled into a ten!`,
    },
    {
      ask: (n) => `This is the last stop, ${n}! Show a grown-up and finish the adventure.`,
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
    case 2:
      return level.puzzle.target - level.puzzle.start;
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
  return { items: n, away: 0, caption: story.mission(n) };
}

export function storyFor(grade: Grade, level: number): StoryStop | null {
  return STORIES[grade][level - 1] ?? null;
}
