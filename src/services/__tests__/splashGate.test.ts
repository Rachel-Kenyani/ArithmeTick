import { backdropPainted, paintCounter, resetSplashGate, whenBackdropPainted } from "@/services/splashGate";

describe("splashGate", () => {
  beforeEach(() => {
    resetSplashGate();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it("waits for the background to be drawn", async () => {
    let done = false;
    void whenBackdropPainted(5000).then(() => (done = true));
    await jest.advanceTimersByTimeAsync(100);
    expect(done).toBe(false);
    backdropPainted();
    await jest.advanceTimersByTimeAsync(0);
    expect(done).toBe(true);
  });

  it("gives up after the longest wait, so a slow image never traps the app on the splash", async () => {
    let done = false;
    void whenBackdropPainted(1500).then(() => (done = true));
    await jest.advanceTimersByTimeAsync(1500);
    expect(done).toBe(true);
  });

  it("resolves at once when the background was already drawn", async () => {
    backdropPainted();
    await expect(whenBackdropPainted()).resolves.toBeUndefined();
  });

  it("reports drawn only after the last of a background's images loads", async () => {
    let done = false;
    void whenBackdropPainted(5000).then(() => (done = true));
    const onLoad = paintCounter(3);
    onLoad();
    onLoad();
    await jest.advanceTimersByTimeAsync(50);
    expect(done).toBe(false);
    onLoad();
    await jest.advanceTimersByTimeAsync(50);
    expect(done).toBe(true);
  });
});
