/**
 * Mock leaderboard data. Framed as a friendly "Star Explorers" board with a shared team goal —
 * collective, encouraging, never a ranking of who is "last" (the child's own row is always shown).
 */

import type { AvatarKind, ChildProfile } from "@/types/models";
import { AVATARS } from "@/types/models";

export type LeaderScope = "class" | "school";

export interface LeaderRow {
  id: string;
  name: string;
  avatar: AvatarKind;
  stars: number;
  isYou: boolean;
  rank: number;
}

export interface Leaderboard {
  scope: LeaderScope;
  rows: LeaderRow[];
  /** The child's row (also inside `rows` when in the top list). */
  you: LeaderRow;
  /** Stars the whole class/school collected this week, and the shared goal. */
  teamStars: number;
  teamGoal: number;
}

const CLASSMATES = [
  "Wanjiru", "Otieno", "Achieng", "Kamau", "Njeri", "Kiprop", "Fatuma", "Baraka",
  "Zawadi", "Mumbua", "Chebet", "Juma", "Nafula", "Mwangi", "Akinyi", "Wekesa",
];

/** Deterministic pseudo-random 0..1 from a string + salt (stable between renders). */
function hash01(text: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/** Tie-break for equal stars: you first, then peers alphabetically. */
function compareRowsAfterStars(a: { isYou: boolean; name: string }, b: { isYou: boolean; name: string }): number {
  if (a.isYou) return -1;
  if (b.isYou) return 1;
  return a.name.localeCompare(b.name);
}

export function leaderboardFor(scope: LeaderScope, child: ChildProfile, topN = 10): Leaderboard {
  const size = scope === "class" ? 12 : 16;
  const maxStars = scope === "class" ? 36 : 54;
  const peers = CLASSMATES.slice(0, size).map((name, i) => ({
    id: `${scope}-${name}`,
    name,
    avatar: AVATARS[i % AVATARS.length],
    stars: 3 * Math.round((hash01(`${name}-${child.grade}`, scope === "class" ? 7 : 13) * maxStars) / 3),
    isYou: false,
  }));
  const all = [...peers, { id: child.id, name: child.name, avatar: child.avatar, stars: child.stars, isYou: true }]
    .sort((a, b) => b.stars - a.stars || compareRowsAfterStars(a, b))
    .map((r, i) => ({ ...r, rank: i + 1 }));
  const you = all.find((r) => r.isYou)!;
  const teamStars = all.reduce((sum, r) => sum + r.stars, 0);
  const teamGoal = Math.ceil((teamStars + 30) / 50) * 50;
  return { scope, rows: all.slice(0, topN), you, teamStars, teamGoal };
}
