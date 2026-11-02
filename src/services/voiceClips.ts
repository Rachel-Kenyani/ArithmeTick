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
export const VOICE_WORDS = loaded.words;

export const OPENERS = ["opener-1", "opener-2", "opener-3", "opener-4"];
export const THANKS = [
  { id: "thanks-1", text: "Thank you!" },
  { id: "thanks-2", text: "Asante sana!" },
  { id: "thanks-3", text: "You're amazing!" },
] as const;

export const levelClip = (grade: number, level: number, part: "ask" | "done") =>
  `g${grade}-l${String(level).padStart(2, "0")}-${part}`;
