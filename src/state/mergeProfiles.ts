import type { Grade } from "@/types/domain";
import type { AttemptLog, ChildProfile } from "@/types/models";

/** Same cap as the phone keeps. */
const MAX_ATTEMPTS = 200;
const MAX_DAYS = 30;
const GRADES: Grade[] = [1, 2, 3];

const unionOf = (a: readonly string[] = [], b: readonly string[] = []) => [...a, ...b.filter((x) => !a.includes(x))];

function maxPerGrade(a: Partial<Record<Grade, number>> = {}, b: Partial<Record<Grade, number>> = {}): Partial<Record<Grade, number>> {
  const out: Partial<Record<Grade, number>> = {};
  for (const g of GRADES) {
    const value = Math.max(a[g] ?? 0, b[g] ?? 0);
    if (value || a[g] !== undefined || b[g] !== undefined) out[g] = value;
  }
  return out;
}

const attemptKey = (a: AttemptLog) => `${a.grade}:${a.level}:${a.at}:${a.answer}`;

function mergeAttempts(a: readonly AttemptLog[] = [], b: readonly AttemptLog[] = []): AttemptLog[] {
  const seen = new Map<string, AttemptLog>();
  for (const attempt of [...a, ...b]) seen.set(attemptKey(attempt), attempt);
  return [...seen.values()].sort((x, y) => x.at - y.at).slice(-MAX_ATTEMPTS);
}

/**
 * One child as played on two phones, combined so nothing they earned is lost: the furthest level in each grade, the
 * most stars, every badge, and every answer. The name, animal and settings come from whichever copy was edited last.
 * Unfinished boards stay with the phone they were left on (`local`).
 */
export function mergeProfile(local: ChildProfile, remote: ChildProfile): ChildProfile {
  const identity = (remote.editedAt ?? 0) > (local.editedAt ?? 0) ? remote : local;
  return {
    ...local,
    name: identity.name,
    avatar: identity.avatar,
    grade: identity.grade,
    schoolCode: identity.schoolCode,
    sound: identity.sound,
    editedAt: Math.max(local.editedAt ?? 0, remote.editedAt ?? 0) || undefined,
    progress: maxPerGrade(local.progress, remote.progress) as Record<Grade, number>,
    stars: Math.max(local.stars, remote.stars),
    badges: unionOf(local.badges, remote.badges),
    highFives: Math.max(local.highFives, remote.highFives),
    questsDone: Math.max(local.questsDone, remote.questsDone),
    cleanSolves: maxPerGrade(local.cleanSolves, remote.cleanSolves),
    helpedSolves: Math.max(local.helpedSolves ?? 0, remote.helpedSolves ?? 0),
    cleanLevels: unionOf(local.cleanLevels, remote.cleanLevels),
    replays: Math.max(local.replays ?? 0, remote.replays ?? 0),
    daysPlayed: unionOf(local.daysPlayed, remote.daysPlayed).slice(-MAX_DAYS),
    attempts: mergeAttempts(local.attempts, remote.attempts),
    gradeSeconds: maxPerGrade(local.gradeSeconds, remote.gradeSeconds),
    drafts: local.drafts,
  };
}

/** A family from this phone and from the account, combined: every child from either, matched by id, in phone order. */
export function mergeFamilies(local: readonly ChildProfile[], remote: readonly ChildProfile[]): ChildProfile[] {
  const fromRemote = new Map(remote.map((p) => [p.id, p]));
  const merged = local.map((p) => {
    const other = fromRemote.get(p.id);
    return other ? mergeProfile(p, other) : p;
  });
  const localIds = new Set(local.map((p) => p.id));
  return [...merged, ...remote.filter((p) => !localIds.has(p.id)).map((p) => ({ ...p, drafts: undefined }))];
}

/** What is saved with the account: everything except unfinished boards, which only make sense on this phone. */
export function forAccount(profile: ChildProfile): Omit<ChildProfile, "drafts"> {
  const { drafts: _drafts, ...rest } = profile;
  return rest;
}
