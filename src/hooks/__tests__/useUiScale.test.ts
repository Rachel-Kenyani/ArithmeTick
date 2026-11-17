import { uiScaleFor } from "@/hooks/useUiScale";

describe("uiScaleFor", () => {
  it.each([
    [390, 844],
    [430, 932],
    [412, 915],
  ])("leaves a %ix%i phone at its normal size", (w, h) => {
    expect(uiScaleFor(w, h)).toBe(1);
  });

  it("enlarges an iPad mini a little", () => {
    expect(uiScaleFor(744, 1133)).toBeCloseTo(1.33, 2);
  });

  it("enlarges an iPad the same way in portrait and landscape", () => {
    expect(uiScaleFor(820, 1180)).toBe(uiScaleFor(1180, 820));
    expect(uiScaleFor(820, 1180)).toBeCloseTo(1.46, 2);
  });

  it("stops at 1.5 on big tablets like the Surface Pro", () => {
    expect(uiScaleFor(912, 1368)).toBe(1.5);
    expect(uiScaleFor(1024, 1366)).toBe(1.5);
  });
});
