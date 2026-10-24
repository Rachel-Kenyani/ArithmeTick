/**
 * Splash intro — colours and layout geometry (Figma artboard units) shared by the splash components.
 */

export const BG = "#D2EFEC";
export const SKY_BASE = "#2a7fc8";
export const TRI = "#00B2A9";
export const TEAL = "#009088";
export const PURPLE_DARK = "#6D41A3";
export const PURPLE = "#884DCF";
export const GOLD = "#FEAD1D";

/** Logo artboard: 383 wide; the owl occupies y 0…104, the wordmark y 104…165. */
export const LOGO_W = 383;
export const OWL_H = 104;
export const WORD_TOP = 104;
export const WORD_H = 61;
/** Owl body (head ellipse) width in the 383 artboard; its centre's y. */
export const OWL_BODY_SMALL = 96;
export const OWL_BODY_SMALL_CY = 61.65;
/**
 * The big owl: Logo-splash-9's 246×321 artboard, drawn at 1 unit = screen width / 428 (the frames' 428 width).
 * Its head is Logo-splash-4-6-7-&-8 (same size, same y); the head-only artboard is y 0…181, so in frames 4–8
 * that artboard's middle (y 90.5) sits at the screen centre, and in frame 9 the whole 321-tall owl is centred.
 */
/** Frame 7: head centre at 342.5/926 of the screen height. Frame 8: head shifted 52.5/428 of the width right. */
export const FRAME7_HEAD_Y = 342.5 / 926;
export const FRAME8_SHIFT = 52.5;
/** Frame 14: the returning wordmark's centre, as a fraction of the screen height. */
export const FINALE_WORD_Y = 1430 / 2000;
/**
 * Frame 14's wordmark (Logo.svg): a 428×62 artboard spanning the screen width. Its letters are the frame-1 wordmark's,
 * shifted right by `dx`; `top` is the artboard's top edge in the frame-1 coordinates.
 */
export const FINALE_LOGO = { w: 428, h: 62, dx: 22.7268, top: 103.7169 } as const;
export const BIG = {
  w: 246,
  h: 321,
  cx: 125.63,
  bodyW: 171.3,
  bodyCy: 107.35,
  headMid: 90.5,
} as const;
/** Frame 3 sits this far below the vertical centre (frame 2 is exactly centred). */
export const FRAME3_DROP = 29;
