/** Side gutter: 16 from 640px, 12 from 380px, else 8. */
export function gutterFor(width: number) {
  if (width >= 640) return 16;
  return width >= 380 ? 12 : 8;
}
