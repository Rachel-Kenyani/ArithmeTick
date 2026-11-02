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
  const logoW = Math.min(W - 44, 420);
  const k = logoW / LOGO_W;
  const logoH = k * (OWL_H + WORD_H);
  const centreShift = (k * WORD_H) / 2;

  const unit = W / 428;
  const frame3BodyY =
    k * OWL_BODY_SMALL_CY - logoH / 2 + centreShift + FRAME3_DROP;
  const bigStartScale = (k * OWL_BODY_SMALL) / (unit * BIG.bodyW);
  const bigStartY = frame3BodyY - unit * (BIG.bodyCy - BIG.headMid);
  const frame7Y = FRAME7_HEAD_Y * H - H / 2 - unit * (BIG.bodyCy - BIG.headMid);
  const frame8X = FRAME8_SHIFT * unit;
  const branchTop = H / 2 - BIG.headMid * unit + frame7Y;
  const grassH = (GRASS.bottom - GRASS.top) * unit;
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
