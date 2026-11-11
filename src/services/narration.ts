import { createAudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";

import {
  OPENERS,
  VOICE_CLIPS,
  VOICE_WORDS,
  levelClip,
} from "@/services/voiceClips";
import { joinSpokenNumbers, numberWord } from "./spokenNumbers";

export interface SpokenRange {
  text: string;
  from: number;
  to: number;
}

interface Part {
  id: string;
  from: number;
  to: number;
}

const TICK_MS = 60;

let stopSequence: (() => void) | null = null;
let ticker: ReturnType<typeof setInterval> | null = null;
let run = 0;
let spoken: SpokenRange | null = null;
const listeners = new Set<(range: SpokenRange | null) => void>();

const pick = (ids: readonly string[]) =>
  ids[Math.floor(Math.random() * ids.length)];
export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);

function publish(range: SpokenRange | null) {
  if (
    range === spoken ||
    (range &&
      range.text === spoken?.text &&
      range.from === spoken.from &&
      range.to === spoken.to)
  )
    return;
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

/** Lower-case and strip punctuation, writing any number word as a numeral so "eleven" matches "11". */
function norm(word: string) {
  const n = word.toLowerCase() === "zero" ? 0 : numberWord(word);
  return n === null ? word.toLowerCase().replace(/[^a-z0-9]/g, "") : String(n);
}

function wordStarts(shown: string[], spoken: [string, number][]): number[] {
  const heard = joinSpokenNumbers(spoken);
  const a = shown.map(norm);
  const b = heard.map(([w]) => norm(w));
  const lcs = a.map(() => new Array<number>(b.length + 1).fill(0));
  lcs.push(new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
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

const MIN_WORD_MS = 220;
const HOLD_LAST_MS = 450;

function fitStarts(starts: number[], durationMs: number): number[] {
  if (!durationMs) return starts;
  return starts.map((ms, i) =>
    Math.max(0, Math.min(ms, durationMs - (starts.length - i) * MIN_WORD_MS)),
  );
}

function playParts(text: string, parts: Part[], ticket: number) {
  const shown = wordsOf(text);
  const players = parts.map((p) =>
    VOICE_CLIPS[p.id] === undefined
      ? null
      : createAudioPlayer(VOICE_CLIPS[p.id] as number, { keepAudioSessionActive: true }),
  );
  /** Pauses before releasing: on iOS a released player can keep sounding, so a repeat would talk over it. */
  const release = () =>
    players.forEach((p) => {
      try {
        p?.pause();
      } catch {}
      try {
        p?.remove();
      } catch {}
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
    const aligned =
      heard?.length && read.length
        ? wordStarts(
            read.map((i) => shown[i]),
            heard,
          )
        : null;
    let starts: number[] | null = null;
    let begun = false;
    let finished = false;

    const go = () => {
      if (begun || ticket !== run) return;
      begun = true;
      starts = aligned ? fitStarts(aligned, next.duration * 1000) : null;
      let first: SpokenRange | null = null;
      if (starts) {
        first = { text, from: read[0], to: read[0] + 1 };
      } else if (read.length) {
        first = { text, from: part.from, to: part.to };
      }
      publish(first);
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
      if (read.length)
        publish({
          text,
          from: read.at(-1) as number,
          to: (read.at(-1) as number) + 1,
        });
      const last = index === parts.length - 1;
      setTimeout(
        () => {
          if (ticket !== run) return;
          if (last) publish(null);
          start(index + 1);
        },
        last ? HOLD_LAST_MS : 0,
      );
    });
    if (next.isLoaded) go();
  };
  start(0);
}

function speak(
  text: string,
  ticket: number,
  from = 0,
  to = wordsOf(text).length,
  then?: () => void,
) {
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

let voiceOn = true;
const voiceListeners = new Set<() => void>();

/** Whether Brijo reads instructions aloud. A grown-up turns this off in Settings; sound effects are separate. */
function setVoiceOn(next: boolean) {
  if (next === voiceOn) return;
  voiceOn = next;
  if (!next) stopAll();
  voiceListeners.forEach((fn) => fn());
}

function say(text: string, parts: Part[], force = false) {
  if (!voiceOn && !force) return;
  stopAll();
  try {
    const playable = parts.filter(
      (p) => VOICE_CLIPS[p.id] !== undefined || p.to > p.from,
    );
    if (playable.some((p) => VOICE_CLIPS[p.id] !== undefined)) {
      playParts(text, playable, run);
    } else {
      speak(text, run);
    }
  } catch {}
}

export const narration = {
  /** `force` is for the child's own repeat, which plays even with Brijo's voice turned off. */
  story(text: string, grade: number, level: number, force = false) {
    say(
      text,
      [
        { id: pick(OPENERS), from: 0, to: 0 },
        { id: levelClip(grade, level, "ask"), from: 0, to: wordsOf(text).length },
      ],
      force,
    );
  },
  done(
    line: string,
    cheer: { id: string; text: string },
    grade: number,
    level: number,
  ) {
    const split = wordsOf(line).length;
    const text = `${line} ${cheer.text}`;
    say(text, [
      { id: levelClip(grade, level, "done"), from: 0, to: split },
      { id: cheer.id, from: split, to: wordsOf(text).length },
    ]);
  },
  prompt(text: string, clipId: string) {
    say(text, [{ id: clipId, from: 0, to: wordsOf(text).length }]);
  },
  /** Reads one instruction when the child asks, even with Brijo's voice turned off. */
  replay(text: string, clipId: string) {
    say(text, [{ id: clipId, from: 0, to: wordsOf(text).length }], true);
  },
  number(n: number) {
    say(String(n), [{ id: `num-${n}`, from: 0, to: 1 }]);
  },
  quest(
    story: string,
    steps: string,
    grade: number,
    level: number,
    task: string,
    force = false,
  ) {
    const split = wordsOf(story).length;
    const text = `${story} ${steps}`;
    say(
      text,
      [
        { id: levelClip(grade, level, "ask"), from: 0, to: split },
        { id: `quest-${task}`, from: split, to: wordsOf(text).length },
      ],
      force,
    );
  },
  stop: stopAll,
  subscribe(fn: (range: SpokenRange | null) => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  current: () => spoken,
  setVoiceOn,
  isVoiceOn: () => voiceOn,
  subscribeVoice(fn: () => void) {
    voiceListeners.add(fn);
    return () => {
      voiceListeners.delete(fn);
    };
  },
};
