import type { ChildProfile } from "@/types/models";
import { levelCount } from "@/data/levels";
import type { Grade } from "@/types/domain";

export type BadgeTone = "teal" | "purple" | "yellow" | "plum" | "leaf";

export interface BadgeDef {
  id: string;
  name: string;
  how: string;
  about: string;
  tone: BadgeTone;
  grade?: Grade;
  test: (p: ChildProfile) => boolean;
}

const reached = (grade: Grade, level: number) => (p: ChildProfile) => p.progress[grade] >= level;

export const BADGES: readonly BadgeDef[] = [
  { id: "ten-frame-explorer", name: "Ten-Frame Explorer", how: "Grade 1 · Level 1", about: "You filled your first ten-frame with Brijo.", tone: "teal", grade: 1, test: reached(1, 1) },
  { id: "feather-finder", name: "Feather Finder", how: "Grade 1 · Level 2", about: "You found all seven of Brijo's feathers.", tone: "teal", grade: 1, test: reached(1, 2) },
  { id: "shell-seeker", name: "Shell Seeker", how: "Grade 1 · Level 4", about: "You put eight shells from the river on the board.", tone: "teal", grade: 1, test: reached(1, 4) },
  { id: "number-builder", name: "Number Builder", how: "Grade 1 · Level 5", about: "You took some away and counted what was left.", tone: "teal", grade: 1, test: reached(1, 5) },
  { id: "groups-guru", name: "Groups Guru", how: "Grade 1 · Level 6", about: "You made real groups with your own hands, twice.", tone: "leaf", grade: 1, test: reached(1, 6) },
  { id: "flower-planter", name: "Flower Planter", how: "Grade 1 · Level 7", about: "You helped Brijo plant nine flowers.", tone: "teal", grade: 1, test: reached(1, 7) },
  { id: "soup-helper", name: "Soup Helper", how: "Grade 1 · Level 8", about: "You took four tomatoes away for Brijo's soup.", tone: "teal", grade: 1, test: reached(1, 8) },
  { id: "first-try-1", name: "First Try", how: "Solve 3 Grade 1 levels with no wrong answers", about: "You counted carefully and got it right the first time.", tone: "plum", grade: 1, test: (p) => (p.cleanSolves?.[1] ?? 0) >= 3 },
  { id: "grade-1-champion", name: "Grade 1 Champion", how: "Finish Grade 1", about: "You finished every Grade 1 stop on Brijo's map.", tone: "teal", grade: 1, test: reached(1, levelCount(1)) },

  { id: "place-value-pro", name: "Place Value Pro", how: "Grade 2 · Level 1", about: "You packed tomatoes into full crates of ten.", tone: "purple", grade: 2, test: reached(2, 1) },
  { id: "countdown-captain", name: "Countdown Captain", how: "Grade 2 · Level 2", about: "You counted back all the way from fifty.", tone: "purple", grade: 2, test: reached(2, 2) },
  { id: "hand-measurer", name: "Hand Measurer", how: "Grade 2 · Level 3", about: "You measured a table with your own hands.", tone: "leaf", grade: 2, test: reached(2, 3) },
  { id: "count-on-climber", name: "Count-On Climber", how: "Grade 2 · Level 4", about: "You filled a crate and kept on counting.", tone: "purple", grade: 2, test: reached(2, 4) },
  { id: "number-detective", name: "Number Detective", how: "Grade 2 · Level 5", about: "You opened a crate to take away, like a real detective.", tone: "purple", grade: 2, test: reached(2, 5) },
  { id: "seed-sower", name: "Seed Sower", how: "Grade 2 · Level 7", about: "You planted seeds two by two and counted in twos.", tone: "purple", grade: 2, test: reached(2, 7) },
  { id: "fair-sharer", name: "Fair Sharer", how: "Grade 2 · Level 8", about: "You shared the tomatoes fairly between two monkeys.", tone: "purple", grade: 2, test: reached(2, 8) },
  { id: "market-shopper", name: "Market Shopper", how: "Grade 2 · Level 9", about: "You paid thirty shillings in ten-shilling coins.", tone: "leaf", grade: 2, test: reached(2, 9) },
  { id: "time-keeper", name: "Time Keeper", how: "Grade 2 · Level 11", about: "You set the clock to three o'clock.", tone: "purple", grade: 2, test: reached(2, 11) },
  { id: "shape-builder", name: "Shape Builder", how: "Grade 2 · Level 12", about: "You built Brijo a house out of shapes.", tone: "leaf", grade: 2, test: reached(2, 12) },
  { id: "first-try-2", name: "First Try", how: "Solve 3 Grade 2 levels with no wrong answers", about: "You worked carefully and got it right the first time.", tone: "plum", grade: 2, test: (p) => (p.cleanSolves?.[2] ?? 0) >= 3 },
  { id: "grade-2-champion", name: "Grade 2 Champion", how: "Finish Grade 2", about: "You finished every Grade 2 stop on Brijo's map.", tone: "purple", grade: 2, test: reached(2, levelCount(2)) },

  { id: "array-architect", name: "Array Architect", how: "Grade 3 · Level 2", about: "You built your first array of rows and columns.", tone: "yellow", grade: 3, test: reached(3, 2) },
  { id: "regroup-ranger", name: "Regroup Ranger", how: "Grade 3 · Level 5", about: "You swapped tens and ones to solve a tricky sum.", tone: "yellow", grade: 3, test: reached(3, 5) },
  { id: "grade-3-champion", name: "Grade 3 Champion", how: "Finish Grade 3", about: "You finished every Grade 3 stop on Brijo's map.", tone: "yellow", grade: 3, test: reached(3, levelCount(3)) },

  { id: "hands-on-hero", name: "Hands-On Hero", how: "Finish a Move & Play level", about: "You got up and did maths with real things around you.", tone: "leaf", test: (p) => p.questsDone >= 1 },
  { id: "move-master", name: "Move Master", how: "Finish 3 Move & Play levels", about: "You moved, measured and built with maths three times.", tone: "leaf", test: (p) => p.questsDone >= 3 },
  { id: "high-five-hero", name: "High-Five Hero", how: "5 real high-fives", about: "You shared five real high-fives with a grown-up.", tone: "plum", test: (p) => p.highFives >= 5 },
  { id: "never-give-up", name: "Never Give Up", how: "Finish a level after Brijo helped", about: "It was tricky, Brijo helped, and you kept going.", tone: "plum", test: (p) => (p.helpedSolves ?? 0) >= 1 },
  { id: "busy-bee", name: "Busy Bee", how: "Play on 3 different days", about: "You came back to play on three different days.", tone: "yellow", test: (p) => (p.daysPlayed?.length ?? 0) >= 3 },
  { id: "star-collector", name: "Star Collector", how: "Collect 30 stars", about: "You collected thirty stars by solving levels.", tone: "yellow", test: (p) => p.stars >= 30 },
  { id: "super-star", name: "Super Star", how: "Collect 60 stars", about: "Sixty stars! You are a maths super star.", tone: "yellow", test: (p) => p.stars >= 60 },
];

export function getBadge(id: string): BadgeDef | null {
  return BADGES.find((b) => b.id === id) ?? null;
}

export function newlyEarned(p: ChildProfile): string[] {
  return BADGES.filter((b) => !p.badges.includes(b.id) && b.test(p)).map((b) => b.id);
}
