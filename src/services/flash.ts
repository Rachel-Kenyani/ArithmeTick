/**
 * One-time hand-offs between screens (no secrets, in memory only — replaces the web's sessionStorage flag).
 * Reset Password sets it; Log In consumes it to show the "Password updated" note once.
 */

let passwordUpdated = false;

export function markPasswordUpdated(): void {
  passwordUpdated = true;
}

/** true once after markPasswordUpdated(), then false until it is marked again. */
export function consumePasswordUpdated(): boolean {
  const was = passwordUpdated;
  passwordUpdated = false;
  return was;
}
