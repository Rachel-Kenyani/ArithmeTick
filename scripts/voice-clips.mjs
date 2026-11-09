import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DIR = "assets/voice";
const SCRIPTS = "docs/voice";
const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const WHISPER = "/opt/homebrew/bin/whisper-cli";
const model = process.env.WHISPER_MODEL;
/** `--relabel` corrects the words of the timings already in clips.ts from the scripts, without transcribing. */
const relabelOnly = process.argv.includes("--relabel");
const ids = readdirSync(join(DIR, "en"))
  .filter((f) => f.endsWith(".m4a"))
  .map((f) => f.slice(0, -4))
  .sort();

function wordTimes(id, work) {
  const wav = join(work, `${id}.wav`);
  execFileSync(FFMPEG, ["-loglevel", "error", "-y", "-i", join(DIR, "en", `${id}.m4a`), "-ar", "16000", "-ac", "1", wav]);
  execFileSync(WHISPER, ["-m", model, "-f", wav, "-ml", "1", "-sow", "-oj", "-np", "-of", join(work, id)], { stdio: "ignore" });
  const { transcription } = JSON.parse(readFileSync(join(work, `${id}.json`), "utf8"));
  return transcription
    .map((s) => [s.text.trim(), s.offsets.from])
    .filter(([w]) => w);
}

/** What each clip says, from the recording scripts: `file.m4a` | words | rows, with **bold** stripped. */
function scriptLines() {
  const lines = {};
  if (!existsSync(SCRIPTS)) return lines;
  for (const file of readdirSync(SCRIPTS).filter((f) => f.endsWith(".md"))) {
    for (const row of readFileSync(join(SCRIPTS, file), "utf8").split("\n")) {
      const cells = row.split("|").map((c) => c.trim());
      const at = cells.findIndex((c) => /^`[A-Za-z0-9-]+\.m4a`$/.test(c));
      if (at < 0 || !cells[at + 1]) continue;
      lines[cells[at].slice(1, -5)] = cells[at + 1].replaceAll("**", "");
    }
  }
  return lines;
}

const UNITS = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** Lower case, no punctuation, and number words as numerals, so "Six," and "6" compare equal. */
function norm(word) {
  const w = word.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (UNITS.includes(w)) return String(UNITS.indexOf(w));
  const [t, u] = w.split("-");
  const unitOk = u === undefined || (UNITS.includes(u) && u !== "zero");
  if (t && TENS.includes(t) && unitOk) return String(TENS.indexOf(t) * 10 + (u ? UNITS.indexOf(u) : 0));
  return w.replaceAll("-", "");
}

function editRatio(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length] / Math.max(1, a.length, b.length);
}

/**
 * The transcriber mishears names and soft words ("Brijo" as "Bridger", "fill" as "feel"), which stops the on-screen
 * word lighting up. The script says what was recorded, so each heard word is lined up with the script by position
 * and similarity, and takes the script's spelling while keeping its timing. Script words with no heard partner are
 * left out; the app spreads their timing between their neighbours.
 */
function relabel(heard, line) {
  const said = line.split(/\s+/).filter(Boolean);
  const a = said.map(norm);
  const b = heard.map(([w]) => norm(w));
  const sub = (i, j) => (a[i] === b[j] ? 0 : 0.4 + 0.6 * editRatio(a[i], b[j]));
  const cost = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length; i >= 0; i--) {
    for (let j = b.length; j >= 0; j--) {
      if (i === a.length) cost[i][j] = b.length - j;
      else if (j === b.length) cost[i][j] = a.length - i;
      else cost[i][j] = Math.min(sub(i, j) + cost[i + 1][j + 1], 1 + cost[i + 1][j], 1 + cost[i][j + 1]);
    }
  }
  const out = [];
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (cost[i][j] === sub(i, j) + cost[i + 1][j + 1]) {
      out.push([said[i], heard[j][1]]);
      i++;
      j++;
    } else if (cost[i][j] === 1 + cost[i + 1][j]) {
      i++;
    } else {
      j++;
    }
  }
  return out;
}

function previousWords() {
  const file = join(DIR, "clips.ts");
  if (!existsSync(file)) return {};
  const m = readFileSync(file, "utf8").match(/export const words[^=]*= (\{.*\});/);
  return m ? JSON.parse(m[1]) : {};
}

/** Clips that already have timings keep them; only new clips are transcribed, unless `--all` is passed. */
const words = process.argv.includes("--all") ? {} : previousWords();
const untimed = ids.filter((id) => !words[id]?.length);
if (relabelOnly || untimed.length === 0) {
  // Nothing to transcribe.
} else if (model && existsSync(model)) {
  const work = mkdtempSync(join(tmpdir(), "voice-"));
  for (const id of untimed) words[id] = wordTimes(id, work);
  rmSync(work, { recursive: true });
  console.log(`Transcribed ${untimed.length} clip(s): ${untimed.join(", ")}`);
} else {
  console.warn(`No WHISPER_MODEL: ${untimed.length} clip(s) left without word timings.`);
}
for (const id of Object.keys(words)) {
  if (!ids.includes(id)) delete words[id];
}

const lines = scriptLines();
let corrected = 0;
for (const id of Object.keys(words)) {
  if (!lines[id] || !words[id].length) continue;
  words[id] = relabel(words[id], lines[id]);
  corrected++;
}

const out = [
  "// Generated by scripts/voice-clips.mjs. Not in git: the recordings are © Rachel Kenyani (see README).",
  "",
  "const clips: Record<string, number> = {",
  ...ids.map((id) => `  "${id}": require("./en/${id}.m4a"),`),
  "};",
  "",
  "/** When each spoken word starts: [word as written in the recording script, ms]. */",
  `export const words: Record<string, [string, number][]> = ${JSON.stringify(words)};`,
  "",
  "export default clips;",
  "",
];
writeFileSync(join(DIR, "clips.ts"), out.join("\n"));
console.log(`Wrote ${ids.length} clips (${Object.keys(words).length} with word timings, ${corrected} matched to the scripts) to ${DIR}/clips.ts`);
