const UNITS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

/** The value of one spoken number word ("forty-three" → 43), or null if it isn't one. */
export function numberWord(word: string): number | null {
  const w = word.toLowerCase().replace(/[^a-z-]/g, "");
  if (w in UNITS) return UNITS[w];
  const [tens, unit] = w.split("-");
  if (tens in TENS && (unit === undefined || unit in UNITS)) return TENS[tens] + (unit ? UNITS[unit] : 0);
  return null;
}

/**
 * Joins a spoken number said over several words ("two hundred and forty-three") into one numeral token ("243")
 * timed at its first word, so it lines up with a numeral shown on screen as a single word.
 */
export function joinSpokenNumbers(heard: [string, number][]): [string, number][] {
  const out: [string, number][] = [];
  let i = 0;
  while (i < heard.length) {
    const first = numberWord(heard[i][0]);
    const isHundred = heard[i + 1]?.[0].toLowerCase().replace(/[^a-z]/g, "") === "hundred";
    if (first === null || first > 9 || !isHundred) {
      out.push(first === null ? heard[i] : [String(first), heard[i][1]]);
      i += 1;
      continue;
    }
    let value = first * 100;
    let j = i + 2;
    const afterAnd = heard[j]?.[0].toLowerCase() === "and" ? j + 1 : j;
    const rest = heard[afterAnd] ? numberWord(heard[afterAnd][0]) : null;
    if (rest !== null && rest < 100) {
      value += rest;
      j = afterAnd + 1;
    }
    out.push([String(value), heard[i][1]]);
    i = j;
  }
  return out;
}
