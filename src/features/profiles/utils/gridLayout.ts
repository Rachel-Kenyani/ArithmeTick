export type TileState = "show" | "chosen" | "dimmed";

export function gridLayout(width: number) {
  if (width >= 1024) return { cols: 4, gap: 24, listMax: 896 };
  if (width >= 640) return { cols: 3, gap: 24, listMax: 672 };
  return { cols: 2, gap: 20, listMax: Infinity };
}

export function tileStateFor(chosen: string | null, id: string | null): TileState {
  if (!chosen) return "show";
  return chosen === id ? "chosen" : "dimmed";
}
