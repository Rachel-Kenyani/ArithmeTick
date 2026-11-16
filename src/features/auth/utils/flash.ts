let passwordUpdated = false;

export function markPasswordUpdated(): void {
  passwordUpdated = true;
}

export function consumePasswordUpdated(): boolean {
  const was = passwordUpdated;
  passwordUpdated = false;
  return was;
}
