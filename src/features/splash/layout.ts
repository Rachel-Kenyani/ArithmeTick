/**
 * Splash intro — screen-size-dependent layout: logo sizing, the big owl's starting pose and the frame 7–14 spots.
 */

import { GRASS } from "./art/frame10Art";
import {
  BIG,
  FRAME3_DROP,
  FRAME7_HEAD_Y,
  FRAME8_SHIFT,
  LOGO_W,
  OWL_BODY_SMALL,
  OWL_BODY_SMALL_CY,
  OWL_H,
  WORD_H,
} from "./constants";

export function splashLayout(W: number, H: number) {
  // Frame 1 sizing: the logo spans the screen minus a 22px gutter each side (383 on a 428 phone).
  const logoW = Math.min(W - 44, 420);
  const k = logoW / LOGO_W;
  const logoH = k * (OWL_H + WORD_H);
  // When the wordmark leaves, the owl drifts down to the screen's centre (half the wordmark's height).
  const centreShift = (k * WORD_H) / 2;

  // The big owl, and the pose that makes it sit exactly on the small owl of frame 3 (so the swap is invisible).
  const unit = W / 428;
  const frame3BodyY =
    k * OWL_BODY_SMALL_CY - logoH / 2 + centreShift + FRAME3_DROP; // from screen centre
  const bigStartScale = (k * OWL_BODY_SMALL) / (unit * BIG.bodyW);
  const bigStartY = frame3BodyY - unit * (BIG.bodyCy - BIG.headMid);
  // Frame 7: the head's centre rises to 37% of the screen height; frame 8: it moves 52.5 units right (Figma, 428×926).
  const frame7Y = FRAME7_HEAD_Y * H - H / 2 - unit * (BIG.bodyCy - BIG.headMid);
  const frame8X = FRAME8_SHIFT * unit;
  // Frame 10: the 428×416 branch artboard shares the owl artboard's top edge and spans the screen width.
  const branchTop = H / 2 - BIG.headMid * unit + frame7Y;
  const grassH = (GRASS.bottom - GRASS.top) * unit;
  // Frame 14: the wordmark returns at its full logo width (383 of 428), between the branch and the grass.
  const finaleW = W;
  return {
    logoW,
    logoH,
    centreShift,
    unit,
    bigStartScale,
    bigStartY,
    frame7Y,
    frame8X,
    branchTop,
    grassH,
    finaleW,
  };
}
