/**
 * Brijo mood scripts — keyframe loops and rest poses for every mood.
 */

import { MOODS, type Keyframes, type MoodScript, type Timing } from "./choreography";
import type { BrijoMood } from "./types";

const loopT = (d: number, extra?: Omit<Timing, "d">): Timing => ({ d, ...extra });
const DANCE_TIMES = [0, 0.14, 0.28, 0.42, 0.56, 0.78, 1];
const dance = (): Timing => loopT(2.6, { times: DANCE_TIMES });
const CHEER_TIMES = [0, 0.16, 0.38, 0.7, 1];
const cheer = (): Timing => loopT(1.15, { times: CHEER_TIMES, ease: ["o", "o", "i", "o"] });
const TALK_TIMES = [0, 0.1, 0.2, 0.3, 0.4, 0.52, 0.64, 1];
const zLoop = (delay: number): Timing => loopT(3, { times: [0, 0.25, 0.7, 1], delay });
const Z_LOOP: Keyframes = {
  x: [0, 8, 6, 17],
  y: [0, -15, -30, -44],
  scale: [0.5, 0.8, 1.05, 1.25],
  opacity: [0, 1, 1, 0],
};

/*
 * Tufts keep each mood's static rest tilt; the web's small ear-twitch loops are dropped to keep
 * the number of animated SVG nodes down (they were barely visible at most sizes).
 */
export const SCRIPTS: Record<BrijoMood, MoodScript> = {
  idle: {
    rig: { loop: { y: [0, -2.5, 0] }, t: loopT(3.4) },
    squash: { loop: { scaleY: [1, 1.03, 1], scaleX: [1, 0.99, 1] }, t: loopT(3.4) },
    shadow: { loop: { scaleX: [1, 0.96, 1] }, t: loopT(3.4) },
    head: { loop: { rotate: [0, -3, 0, 3, 0] }, t: loopT(8) },
    wingL: { loop: { rotate: [0, 4, 0] }, t: loopT(3.4) },
    wingR: { loop: { rotate: [0, -4, 0] }, t: loopT(3.4) },
  },
  wave: {
    rig: { loop: { rotate: [-2, 2, -2], y: [0, -2, 0] }, t: loopT(1.8) },
    squash: { loop: { scaleY: [1, 1.02, 1] }, t: loopT(1.8) },
    head: { rest: { rotate: 5 }, loop: { rotate: [4, 7, 4] }, t: loopT(1.8) },
    tuftL: { rest: { rotate: -4 } },
    tuftR: { rest: { rotate: 7 } },
    wingL: { loop: { rotate: [0, 6, 0] }, t: loopT(1.8) },
    wingR: {
      rest: { rotate: -166 },
      loop: { rotate: [-160, -178, -158, -178, -158, -178, -162, -162] },
      t: loopT(2.4, { times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.62, 1] }),
    },
    beak: { rest: { y: 3.5 } },
    mouth: { rest: { scaleY: 0.5 } },
  },
  talk: {
    rig: { loop: { y: [0, -1.5, 0] }, t: loopT(2.6) },
    squash: { loop: { scaleY: [1, 1.02, 1] }, t: loopT(2.6) },
    head: { loop: { rotate: [-4, 4, -4] }, t: loopT(3.2) },
    beak: { loop: { y: [0, 6.5, 1.2, 5.5, 0.4, 6.5, 0, 0] }, t: loopT(1.5, { times: TALK_TIMES }) },
    mouth: { loop: { scaleY: [0, 1, 0.2, 0.85, 0.1, 1, 0, 0] }, t: loopT(1.5, { times: TALK_TIMES }) },
    wingL: { loop: { rotate: [0, 18, 5, 0, 0] }, t: loopT(3.2, { times: [0, 0.15, 0.3, 0.45, 1] }) },
    wingR: { loop: { rotate: [0, 0, -18, -5, 0] }, t: loopT(3.2, { times: [0, 0.5, 0.65, 0.8, 1] }) },
  },
  dance: {
    rig: {
      rest: { rotate: -5 },
      loop: {
        y: [0, -10, 0, -10, 0, -16, 0],
        rotate: [0, -8, 0, 8, 0, 0, 0],
        scaleX: [1, 1, 1, 1, 1, -1, 1],
      },
      t: dance(),
    },
    squash: {
      loop: {
        scaleY: [0.95, 1.04, 0.95, 1.04, 0.92, 1.06, 0.95],
        scaleX: [1.03, 0.98, 1.03, 0.98, 1.05, 0.97, 1.03],
      },
      t: dance(),
    },
    shadow: {
      loop: { scaleX: [1, 0.84, 1, 0.84, 1, 0.7, 1], opacity: [1, 0.7, 1, 0.7, 1, 0.5, 1] },
      t: dance(),
    },
    head: { loop: { rotate: [0, 6, 0, -6, 0, 0, 0] }, t: dance() },
    wingL: { rest: { rotate: 30 }, loop: { rotate: [10, 55, 10, 25, 10, 160, 10] }, t: dance() },
    wingR: { rest: { rotate: -30 }, loop: { rotate: [-10, -25, -10, -55, -10, -160, -10] }, t: dance() },
    footL: { loop: { y: [0, -7, 0, 0, 0, -3, 0], rotate: [0, -16, 0, 0, 0, 8, 0] }, t: dance() },
    footR: { loop: { y: [0, 0, 0, -7, 0, -3, 0], rotate: [0, 0, 0, 16, 0, -8, 0] }, t: dance() },
    beak: { rest: { y: 3.5 }, loop: { y: [2, 5.5, 2, 5.5, 2, 6.5, 2] }, t: dance() },
    mouth: { rest: { scaleY: 0.5 }, loop: { scaleY: [0.3, 0.85, 0.3, 0.85, 0.3, 1, 0.3] }, t: dance() },
  },
  cheer: {
    rig: { loop: { y: [0, -5, -16, 0, 0] }, t: cheer() },
    squash: {
      loop: { scaleY: [0.9, 1.08, 1, 0.88, 0.9], scaleX: [1.06, 0.95, 1, 1.08, 1.06] },
      t: cheer(),
    },
    shadow: { loop: { scaleX: [1, 0.9, 0.66, 1, 1], opacity: [1, 0.8, 0.45, 1, 1] }, t: cheer() },
    tuftL: { rest: { rotate: -8 } },
    tuftR: { rest: { rotate: 8 } },
    wingL: { rest: { rotate: 166 }, loop: { rotate: [160, 170, 178, 164, 160] }, t: cheer() },
    wingR: { rest: { rotate: -166 }, loop: { rotate: [-160, -170, -178, -164, -160] }, t: cheer() },
    footL: { loop: { rotate: [0, 8, 14, 0, 0], y: [0, 0, -2, 0, 0] }, t: cheer() },
    footR: { loop: { rotate: [0, -8, -14, 0, 0], y: [0, 0, -2, 0, 0] }, t: cheer() },
    beak: { rest: { y: 6.5 } },
    mouth: { rest: { scaleY: 1 } },
  },
  sleep: {
    rig: { loop: { y: [0, -1, 0] }, t: loopT(4.2) },
    squash: { loop: { scaleY: [1, 1.045, 1], scaleX: [1, 1.02, 1] }, t: loopT(4.2) },
    shadow: { loop: { scaleX: [1, 1.02, 1] }, t: loopT(4.2) },
    head: { rest: { rotate: 7 }, loop: { rotate: [7, 4, 7] }, t: loopT(4.2) },
    tuftL: { rest: { rotate: 7 } },
    tuftR: { rest: { rotate: -7 } },
    wingL: { loop: { rotate: [0, 3, 0] }, t: loopT(4.2) },
    wingR: { loop: { rotate: [0, -3, 0] }, t: loopT(4.2) },
    z0: { rest: { x: 0, y: -2, scale: 0.6, opacity: 1 }, loop: Z_LOOP, t: zLoop(0) },
    z1: { rest: { x: 8, y: -20, scale: 0.85, opacity: 1 }, loop: Z_LOOP, t: zLoop(1) },
    z2: { rest: { x: 17, y: -41, scale: 1.12, opacity: 1 }, loop: Z_LOOP, t: zLoop(2) },
  },
};

/** Indexed by mood index so worklets can look scripts up from a shared number. */
export const SCRIPT_LIST: MoodScript[] = MOODS.map((m) => SCRIPTS[m]);
