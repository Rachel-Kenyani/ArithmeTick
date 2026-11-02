export function gutterFor(width: number) {
  if (width >= 640) return 16;
  return width >= 380 ? 12 : 8;
}
