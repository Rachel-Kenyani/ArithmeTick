import type { CounterItem } from "@/features/play/components/CounterFace";
import type { LevelDef } from "@/data/levels";
import type { Grade } from "@/types/domain";

export interface StoryStop {
  ask: string;
  treasure: CounterItem;
  one: string;
  many: string;
  mission: (count: number) => string;
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
      ask: "Time to move! Can you find six objects at home that are the same?",
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: () => `Find 6 objects`,
      done: () => `Six objects, all lined up and counted!`,
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
      ask: "Time to move! Brijo loves hide and guess. Can you find how many are hiding?",
      treasure: "cap",
      one: "a bottle top",
      many: "bottle tops",
      mission: () => `Guess the hiding bottle tops`,
      done: () => `You found the hiding bottle tops!`,
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
      ask: "This is the last stop! Let's count on our fingers with a grown-up.",
      treasure: "nest",
      one: "Brijo's nest",
      many: "nests",
      mission: () => `Play finger maths`,
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
      done: () => `Thirty-four tomatoes: three full crates and four left over!`,
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
      ask: "Time to move! How many hands long is your table?",
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
      ask: "Time to move! It's market day. Can you pay thirty shillings?",
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
      ask: "Time to move! The wind blew Brijo's nest away. Can you build her a house out of shapes?",
      treasure: "nest",
      one: "Brijo's nest",
      many: "nests",
      mission: () => `Build a shape house`,
      done: () => `Brijo has a shape house to sleep in!`,
    },
  ],
  3: [
    {
      ask: "Brijo's farm grew 243 mangoes! Pack 10 crates into each big box. How many hundreds, tens and ones are there?",
      treasure: "mango",
      one: "a mango",
      many: "mangoes",
      mission: () => `Pack crates into hundreds`,
      done: () => `2 hundreds, 4 tens and 3 ones make 243!`,
    },
    {
      ask: "Brijo is counting her mangoes in tens, starting at 130. Can you fill in the missing numbers?",
      treasure: "mango",
      one: "a mango",
      many: "mangoes",
      mission: () => `Count on in tens from 130`,
      done: () => `You counted in tens all the way to 220!`,
    },
    {
      ask: "Time to move! It's race day! Can you line up 5 toys and say who came 1st, 2nd and 3rd?",
      treasure: "pebble",
      one: "a shiny pebble",
      many: "pebbles",
      mission: () => `Run a toy race`,
      done: () => `You judged the race like a champion!`,
    },
    {
      ask: "Brijo picked 146 mangoes, then 27 more! How many mangoes does she have now?",
      treasure: "mango",
      one: "a mango",
      many: "mangoes",
      mission: (c) => `Add up to ${c} mangoes`,
      done: (c) => `${c} mangoes ready for market day!`,
    },
    {
      ask: "Brijo had 352 mangoes and sold 125 at the market. How many mangoes are left?",
      treasure: "mango",
      one: "a mango",
      many: "mangoes",
      mission: (c) => `Find the ${c} mangoes left`,
      done: (c) => `${c} mangoes left for Brijo!`,
    },
    {
      ask: "Time to move! It's water day! How many litres of water does a big basin hold?",
      treasure: "star",
      one: "a golden star",
      many: "stars",
      mission: () => `Measure water in litres`,
      done: () => `You measured water in litres, just like Brijo!`,
    },
    {
      ask: "Brijo plants seeds in 3 rows, with 4 seeds in each row. How many seeds does she plant?",
      treasure: "seed",
      one: "a seed",
      many: "seeds",
      mission: (c) => `Plant ${c} seeds in rows`,
      done: (c) => `3 rows of 4 make ${c} seeds!`,
    },
    {
      ask: "3 monkeys want to share 12 mangoes fairly. How many mangoes does each monkey get?",
      treasure: "mango",
      one: "a mango",
      many: "mangoes",
      mission: () => `Share 12 mangoes fairly`,
      done: () => `4 mangoes each, a fair share for every monkey!`,
    },
    {
      ask: "Time to move! It's market day! Can you give the right change in shillings?",
      treasure: "drum",
      one: "a little drum",
      many: "drums",
      mission: () => `Give the right change`,
      done: () => `20 shillings change, just right!`,
    },
    {
      ask: "Brijo made a chapati to share with 3 friends. Can you cut it into 4 equal pieces?",
      treasure: "leaf",
      one: "a big leaf",
      many: "leaves",
      mission: () => `Cut the chapati into quarters`,
      done: () => `Brijo got 1 quarter of the chapati!`,
    },
    {
      ask: "Brijo's friends are coming at half past 4. Can you set the clock?",
      treasure: "flower",
      one: "a flower",
      many: "flowers",
      mission: () => `Set the clock to half past 4`,
      done: () => `Half past 4, right on time!`,
    },
    {
      ask: "This is the last stop! Brijo hid a treasure. Can you find it by following directions?",
      treasure: "star",
      one: "a golden star",
      many: "stars",
      mission: () => `Follow the treasure walk`,
      done: () => `You followed the directions and found the treasure!`,
    },
  ],
};

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
      if (op === "add") return a + b;
      if (op === "sub") return a - b;
      return a;
    }
    case 3:
      if (level.game === "hundreds") return level.puzzle.a;
      if (level.game === "numberTrack") return 1;
      if (level.game === "fraction" || level.game === "clock") return 1;
      if (level.game === "halves") return level.puzzle.total / (level.puzzle.shares ?? 2);
      if (level.game === "columns") {
        const { op, a, b } = level.puzzle;
        return op === "add" ? a + b : a - b;
      }
      return level.puzzle.rows * level.puzzle.cols;
  }
}

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
  return {
    items: level.grade === 2 || n > 20 ? 0 : n,
    away: 0,
    caption: story.mission(n),
  };
}

export function storyFor(grade: Grade, level: number): StoryStop | null {
  return STORIES[grade][level - 1] ?? null;
}
