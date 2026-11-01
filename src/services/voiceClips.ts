/**
 * Brijo's recorded lines. The recordings live in assets/voice (kept out of git: see README), so the map is an
 * optional module: a clone without them builds fine and every line falls back to text-to-speech.
 * Keys match the file names; a level's lines are `g{grade}-l{level:02}-ask` and `-done`.
 */

type WordTimes = [word: string, ms: number][];

function loadClips(): { clips: Partial<Record<string, number>>; words: Partial<Record<string, WordTimes>> } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("../../assets/voice/clips");
    return { clips: mod.default ?? {}, words: mod.words ?? {} };
  } catch {
    return { clips: {}, words: {} };
  }
}

const loaded = loadClips();
export const VOICE_CLIPS = loaded.clips;
/** When each word of a clip starts (from scripts/voice-clips.mjs), for highlighting the words as they're read. */
export const VOICE_WORDS = loaded.words;

/** Played before a story line, so the child's name is never recorded. */
export const OPENERS = ["opener-1", "opener-2", "opener-3", "opener-4"];
/** Played after a mission-done line. */
export const THANKS = [
  { id: "thanks-1", text: "Thank you!" },
  { id: "thanks-2", text: "Asante sana!" },
  { id: "thanks-3", text: "You're amazing!" },
] as const;

export const levelClip = (grade: number, level: number, part: "ask" | "done") =>
  `g${grade}-l${String(level).padStart(2, "0")}-${part}`;
