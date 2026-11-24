/**
 * Keeps Android's system splash up until the first screen's background has been drawn, so the app never shows a pale,
 * half-drawn frame between the splash and the jungle. Backgrounds call `backdropPainted()` once their images have
 * loaded; the root layout waits for that, or for SPLASH_MAX_WAIT_MS, whichever comes first.
 */
export const SPLASH_MAX_WAIT_MS = 1500;

let painted = false;
const listeners = new Set<() => void>();

export function backdropPainted() {
  if (painted) return;
  painted = true;
  listeners.forEach((fn) => fn());
}

/** Resolves when a background has been drawn, or after `maxWaitMs`, so a slow image never traps the app on the splash. */
export function whenBackdropPainted(maxWaitMs = SPLASH_MAX_WAIT_MS): Promise<void> {
  if (painted) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      listeners.delete(done);
      resolve();
    };
    const timer = setTimeout(done, maxWaitMs);
    listeners.add(done);
  });
}

/** Counts a background's images as they load and reports it drawn after the last one, one frame later. */
export function paintCounter(total: number): () => void {
  let loaded = 0;
  return () => {
    loaded += 1;
    if (loaded === total) requestAnimationFrame(backdropPainted);
  };
}

/** Clears the state between tests. */
export function resetSplashGate() {
  painted = false;
  listeners.clear();
}
