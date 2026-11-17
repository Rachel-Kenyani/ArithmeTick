/** The first letter of the grown-up's name or email. Phone accounts have no letter, so they show a phone instead. */
export function initialOf(nameOrIdentifier: string): string | null {
  return /\p{L}/u.exec(nameOrIdentifier)?.[0]?.toUpperCase() ?? null;
}
