/**
 * Profiles grid geometry and per-tile animation state.
 */

export type TileState = "show" | "chosen" | "dimmed";

/** Grid columns, gutter and max list width for the window width (web breakpoints: sm 640, lg 1024). */
export function gridLayout(width: number) {
  if (width >= 1024) return { cols: 4, gap: 24, listMax: 896 };
  if (width >= 640) return { cols: 3, gap: 24, listMax: 672 };
  return { cols: 2, gap: 20, listMax: Infinity };
}

/** Before a pick every tile shows; after it the picked one pops and the rest step back. */
export function tileStateFor(chosen: string | null, id: string | null): TileState {
  if (!chosen) return "show";
  return chosen === id ? "chosen" : "dimmed";
}
