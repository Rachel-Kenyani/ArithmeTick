/**
 * Board geometry: where the card, grid, equation, Done button, tray, slots and tray dimples sit (pure maths).
 */

import { CAP_IDS, DONE_GAP, DONE_H, ROW_SIZE } from "../constants";
import type { BoardLayout, Chrome, Geometry, Rect4 } from "../types";
import { equationWidth, pillWidth, sideCardFor } from "./chrome";

export function boardGeometry(L: BoardLayout, W: number, H: number): Geometry {
  const frameExtra = 2 * (L.frameBorder + L.framePad);
  const gridW = L.cell * 5 + L.gap * 4 + frameExtra;
  const gridH = L.cell * 2 + L.gap + frameExtra;
  const trayRows = L.trayCols === 10 ? 1 : 2;
  const trayExtra = 2 * (L.trayBorder + L.trayPad);
  const trayW = L.cap * L.trayCols + L.trayGap * (L.trayCols - 1) + trayExtra;
  const trayH = L.cap * trayRows + L.trayGap * (trayRows - 1) + trayExtra;
  const chrome: Chrome = { sectionGap: L.sectionGap, cardH: L.cardH, dot: L.dot, numeral: L.numeral, eqH: L.eqH, eqFont: L.eqFont };
  const pillW = pillWidth(chrome);
  const eqW = equationWidth(chrome, L.compact);
  const sg = L.sectionGap;
  const mid = W / 2;
  /** The equation with the Done button under it. */
  const eqBlock = L.eqH + DONE_GAP + DONE_H;

  const innerTop = L.pad;
  const innerH = Math.max(0, H - L.pad * 2);
  // main column (flex-1, centred) above the tray
  const mainH = innerH - trayH - sg;

  let contentH: number;
  let grid: Rect4;
  let card: Rect4;
  let eq: Rect4;
  if (L.arrangement === "side") {
    const sideH = sideCardFor(L.cell).h;
    const rowH = Math.max(gridH, sideH);
    contentH = rowH + sg + eqBlock;
    const top = innerTop + Math.max(0, (mainH - contentH) / 2);
    const left = mid - (L.cardW + sg + gridW) / 2;
    card = { x: left, y: top + (rowH - sideH) / 2, w: L.cardW, h: sideH };
    grid = { x: left + L.cardW + sg, y: top + (rowH - gridH) / 2, w: gridW, h: gridH };
    eq = { x: mid - eqW / 2, y: top + rowH + sg, w: eqW, h: L.eqH };
  } else if (L.arrangement === "rail") {
    const colW = Math.max(pillW, eqW);
    const colH = L.cardH + sg + eqBlock;
    const rowH = Math.max(gridH, colH);
    contentH = rowH;
    const top = innerTop + Math.max(0, (mainH - contentH) / 2);
    const left = mid - (colW + sg + gridW) / 2;
    const colTop = top + (rowH - colH) / 2;
    card = { x: left, y: colTop, w: colW, h: L.cardH };
    eq = { x: left, y: colTop + L.cardH + sg, w: colW, h: L.eqH };
    grid = { x: left + colW + sg, y: top + (rowH - gridH) / 2, w: gridW, h: gridH };
  } else {
    contentH = L.cardH + sg + gridH + sg + eqBlock;
    const top = innerTop + Math.max(0, (mainH - contentH) / 2);
    card = { x: mid - pillW / 2, y: top, w: pillW, h: L.cardH };
    grid = { x: mid - gridW / 2, y: top + L.cardH + sg, w: gridW, h: gridH };
    eq = { x: mid - eqW / 2, y: grid.y + gridH + sg, w: eqW, h: L.eqH };
  }
  const contentBottom = innerTop + Math.max(0, (mainH - contentH) / 2) + contentH;
  const trayY = Math.max(innerTop + innerH - trayH, contentBottom + sg);
  const tray: Rect4 = { x: mid - trayW / 2, y: trayY, w: trayW, h: trayH };

  const inset = L.frameBorder + L.framePad;
  const slots = CAP_IDS.map((i) => ({
    x: grid.x + inset + (i % ROW_SIZE) * (L.cell + L.gap) + L.cell / 2,
    y: grid.y + inset + Math.floor(i / ROW_SIZE) * (L.cell + L.gap) + L.cell / 2,
  }));
  const tin = L.trayBorder + L.trayPad;
  const homes = CAP_IDS.map((id) => ({
    x: tray.x + tin + (id % L.trayCols) * (L.cap + L.trayGap) + L.cap / 2,
    y: tray.y + tin + Math.floor(id / L.trayCols) * (L.cap + L.trayGap) + L.cap / 2,
  }));
  const done: Rect4 = { x: eq.x, y: eq.y + eq.h + DONE_GAP, w: eq.w, h: DONE_H };
  return { grid, tray, card, eq, done, slots, homes };
}
