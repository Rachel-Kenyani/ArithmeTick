/**
 * Brijo's voice: recorded clips when there are some (see voiceClips.ts), otherwise the phone's text-to-speech
 * (expo-speech), so a child who can't read yet still hears the story. Follows the game's mute switch; a new
 * line cuts off the last one. While a line plays, the word being read is published (see useSpokenWord), so
 * the text on screen can light up word by word.
 */

import { createAudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";

import { isMuted } from "@/services/audio";
import { OPENERS, VOICE_CLIPS, VOICE_WORDS, levelClip } from "@/services/voiceClips";

/** The words of `text` (split on spaces) being read right now: `from` up to, not including, `to`. */
export interface SpokenRange {
  text: string;
  from: number;
  to: number;
}

/** One clip and the words of the line it reads. */
interface Part {
  id: string;
  from: number;
  to: number;
}

const TICK_MS = 60;

/** Releases every player of the line that is playing. */
let stopSequence: (() => void) | null = null;
let ticker: ReturnType<typeof setInterval> | null = null;
/** Bumped on every new line, so a clip finishing late can't start the next clip of an old sequence. */
let run = 0;
let spoken: SpokenRange | null = null;
const listeners = new Set<(range: SpokenRange | null) => void>();

const pick = (ids: readonly string[]) => ids[Math.floor(Math.random() * ids.length)];
export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);

function publish(range: SpokenRange | null) {
  if (range === spoken || (range && spoken && range.text === spoken.text && range.from === spoken.from && range.to === spoken.to)) return;
  spoken = range;
  listeners.forEach((fn) => fn(range));
}

function stopAll() {
  run += 1;
  if (ticker) clearInterval(ticker);
  ticker = null;
  Speech.stop().catch(() => undefined);
  stopSequence?.();
  stopSequence = null;
  publish(null);
}

const NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
function norm(word: string) {
  const w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  const n = NUMBERS.indexOf(w);
  return n >= 0 ? String(n) : w;
}

/**
 * When each on-screen word starts in the clip. The recogniser mishears some words ("Bijou" for Brijo), so the
 * words it got right anchor the timing (longest common subsequence) and the rest are spread evenly between them.
 */
function wordStarts(shown: string[], heard: [string, number][]): number[] {
  const a = shown.map(norm);
  const b = heard.map(([w]) => norm(w));
  const lcs = a.map(() => new Array<number>(b.length + 1).fill(0));
  lcs.push(new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const starts: (number | null)[] = shown.map(() => null);
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) {
      starts[i++] = heard[j++][1];
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  const end = (heard.at(-1)?.[1] ?? 0) + 400;
  return starts.map((ms, i) => {
    if (ms !== null) return ms;
    let p = i - 1;
    while (p >= 0 && starts[p] === null) p--;
    let n = i + 1;
    while (n < starts.length && starts[n] === null) n++;
    const lo = p >= 0 ? (starts[p] as number) : 0;
    const hi = n < starts.length ? (starts[n] as number) : end;
    return lo + ((hi - lo) * (i - p)) / (n - p);
  });
}

/** Each word gets at least this long on screen, even when the recogniser puts it right at the end of the clip. */
const MIN_WORD_MS = 220;
/** The last word of a line stays lit this long after the audio ends. */
const HOLD_LAST_MS = 450;

/** Keeps every word's start inside the clip, leaving the later words room to be seen. */
function fitStarts(starts: number[], durationMs: number): number[] {
  if (!durationMs) return starts;
  return starts.map((ms, i) => Math.max(0, Math.min(ms, durationMs - (starts.length - i) * MIN_WORD_MS)));
}

/**
 * Plays the clips back to back. All players are created up front so each one has loaded before its turn:
 * calling play() on a player that is still loading can be ignored on iOS, which skipped clips at random.
 */
function playParts(text: string, parts: Part[], ticket: number) {
  const shown = wordsOf(text);
  // A part with no recording yet is read by the phone's voice in its turn (see speak below).
  const players = parts.map((p) => (VOICE_CLIPS[p.id] === undefined ? null : createAudioPlayer(VOICE_CLIPS[p.id] as number)));
  const release = () => players.forEach((p) => {
    try {
      p?.remove();
    } catch {
      // already released
    }
  });
  stopSequence = release;

  const start = (index: number) => {
    if (ticket !== run) return;
    if (index >= parts.length) {
      release();
      stopSequence = null;
      return;
    }
    const part = parts[index];
    const next = players[index];
    if (!next) {
      speak(text, ticket, part.from, part.to, () => start(index + 1));
      return;
    }
    const read: number[] = [];
    for (let i = part.from; i < part.to; i++) read.push(i);
    const heard = VOICE_WORDS[part.id];
    const aligned = heard?.length && read.length ? wordStarts(read.map((i) => shown[i]), heard) : null;
    let starts: number[] | null = null;
    let begun = false;
    let finished = false;

    const go = () => {
      if (begun || ticket !== run) return;
      begun = true;
      starts = aligned ? fitStarts(aligned, next.duration * 1000) : null;
      publish(starts ? { text, from: read[0], to: read[0] + 1 } : read.length ? { text, from: part.from, to: part.to } : null);
      if (starts) {
        const times = starts;
        ticker = setInterval(() => {
          if (ticket !== run || finished) return;
          const ms = next.currentTime * 1000;
          let w = 0;
          while (w + 1 < times.length && times[w + 1] <= ms) w++;
          publish({ text, from: read[w], to: read[w] + 1 });
        }, TICK_MS);
      }
      next.play();
    };

    next.addListener("playbackStatusUpdate", (status) => {
      if (ticket !== run) return;
      if (status.isLoaded && !begun) go();
      if (!status.didJustFinish || finished) return;
      finished = true;
      if (ticker) clearInterval(ticker);
      ticker = null;
      if (read.length) publish({ text, from: read.at(-1) as number, to: (read.at(-1) as number) + 1 });
      const last = index === parts.length - 1;
      setTimeout(() => {
        if (ticket !== run) return;
        if (last) publish(null);
        start(index + 1);
      }, last ? HOLD_LAST_MS : 0);
    });
    if (next.isLoaded) go();
  };
  start(0);
}

/**
 * Speaks words `from`–`to` of `text` with the phone's voice, lighting up each word as the phone reaches it
 * (where the platform reports word boundaries). `then` runs when it finishes, to carry on a sequence.
 */
function speak(text: string, ticket: number, from = 0, to = wordsOf(text).length, then?: () => void) {
  const words = wordsOf(text).slice(from, to);
  const line = words.join(" ");
  const offsets: number[] = [];
  let at = 0;
  for (const w of words) {
    at = line.indexOf(w, at);
    offsets.push(at);
    at += w.length;
  }
  const end = () => {
    if (ticket !== run) return;
    if (then) then();
    else publish(null);
  };
  // A touch slower and brighter than default: clearer for young listeners.
  Speech.speak(line, {
    language: "en-GB",
    rate: 0.9,
    pitch: 1.15,
    onBoundary: (ev: { charIndex?: number } | undefined) => {
      if (ticket !== run || ev?.charIndex === undefined) return;
      let w = 0;
      while (w + 1 < offsets.length && offsets[w + 1] <= ev.charIndex) w++;
      publish({ text, from: from + w, to: from + w + 1 });
    },
    onDone: end,
    onStopped: () => {
      if (ticket === run) publish(null);
    },
    onError: end,
  });
}

/**
 * Plays `parts` back to back. Recorded parts play their clip; the rest are read by the phone's voice in turn,
 * so a recorded line is never lost because a later one isn't recorded yet. A wordless part (an opener) with no
 * clip is skipped. With nothing recorded at all, the phone reads the whole of `text`.
 */
function say(text: string, parts: Part[]) {
  if (isMuted()) return;
  stopAll();
  try {
    const playable = parts.filter((p) => VOICE_CLIPS[p.id] !== undefined || p.to > p.from);
    if (playable.some((p) => VOICE_CLIPS[p.id] !== undefined)) {
      playParts(text, playable, run);
    } else {
      speak(text, run);
    }
  } catch {
    // No audio on this device: the picture and caption still tell the story.
  }
}

export const narration = {
  /** The story card: an opener (no words on screen), then the level's line. */
  story(text: string, grade: number, level: number) {
    say(text, [
      { id: pick(OPENERS), from: 0, to: 0 },
      { id: levelClip(grade, level, "ask"), from: 0, to: wordsOf(text).length },
    ]);
  },
  /** The celebration: the mission-done line, then the thank-you clip whose words `thanks` shows. */
  done(line: string, thanks: { id: string; text: string }, grade: number, level: number) {
    const split = wordsOf(line).length;
    const text = `${line} ${thanks.text}`;
    say(text, [
      { id: levelClip(grade, level, "done"), from: 0, to: split },
      { id: thanks.id, from: split, to: wordsOf(text).length },
    ]);
  },
  /** A board instruction ("How many full crates are there?"): its recorded clip, else the phone's voice. */
  prompt(text: string, clipId: string) {
    say(text, [{ id: clipId, from: 0, to: wordsOf(text).length }]);
  },
  /** One number said aloud while counting ("49"): its recorded clip `num-49`, else the phone's voice. */
  number(n: number) {
    say(String(n), [{ id: `num-${n}`, from: 0, to: 1 }]);
  },
  /**
   * Move & Play: the level's story line (recorded with the story lines), then the task's steps (`steps`, its
   * clip `quest-<task>`). `text` is both, joined with a space.
   */
  quest(story: string, steps: string, grade: number, level: number, task: string) {
    const split = wordsOf(story).length;
    const text = `${story} ${steps}`;
    say(text, [
      { id: levelClip(grade, level, "ask"), from: 0, to: split },
      { id: `quest-${task}`, from: split, to: wordsOf(text).length },
    ]);
  },
  stop: stopAll,
  /** Follow the word being read; called with null when nothing is. */
  subscribe(fn: (range: SpokenRange | null) => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  current: () => spoken,
};
