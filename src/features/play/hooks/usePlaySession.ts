/**
 * usePlaySession — one level's state and effects: stealth PAL, quest chime, completion (recorded once),
 * the High-Five Hero pop, leaving for the map and the daily screen-time tick.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AppState } from "react-native";

import useGoToMap from "@/features/play/hooks/useGoToMap";
import { sfx } from "@/services/audio";
import type { BadgeDef } from "@/data/badges";
import type { LevelDef } from "@/data/levels";
import type { LevelDraft } from "@/types/domain";
import type { ChildProfile } from "@/types/models";
import { actions, draftKey, useScreenTimeRemaining, type LevelCompletion } from "@/state/store";

const HIGH_FIVE_HERO = "high-five-hero";
const HERO_POP_MS = 3200;

/* ------------------------------------------------------------------------------------------------
 * Small external stores (mute lives in lib/audio; foreground state in AppState)
 * ---------------------------------------------------------------------------------------------- */

function subscribeAppState(onChange: () => void) {
  const sub = AppState.addEventListener("change", onChange);
  return () => sub.remove();
}
/** Web paused on document visibilitychange; native pauses whenever the app is not in the foreground. */
const isBackgrounded = () => AppState.currentState !== "active" && AppState.currentState != null;

export function usePlaySession(profile: ChildProfile, level: LevelDef) {
  const backgrounded = useSyncExternalStore(subscribeAppState, isBackgrounded);
  const secondsLeft = useScreenTimeRemaining();
  const goToMap = useGoToMap();

  const isQuest = level.kind === "quest";
  const profileId = profile.id;
  const levelNumber = level.number;

  /* ---- resume: the board as the child left it last time (read once), saved again when they leave ---- */
  const key = draftKey(level.grade, level.number);
  const [saved] = useState(() => profile.drafts?.[key]);

  /* ---- stealth PAL: off at the start of a fresh level (on again when resuming one that had help); flips true once and stays true ---- */
  const [palActive, setPalActive] = useState(saved?.pal ?? false);
  const engagePal = useCallback(() => setPalActive(true), []);

  /* ---- every "Done" press is saved on the phone (time since the level opened, PAL on or off) ---- */
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);
  const palRef = useRef(palActive);
  useEffect(() => {
    palRef.current = palActive;
  }, [palActive]);
  const grade = level.grade;
  const handleAttempt = useCallback(
    ({ target, answer, correct }: { target: number; answer: number; correct: boolean }) => {
      actions.logAttempt(profileId, { grade, level: levelNumber, target, answer, correct, ms: Date.now() - openedAt.current, pal: palRef.current, at: Date.now() });
    },
    [profileId, grade, levelNumber],
  );

  useEffect(() => {
    if (palActive) sfx.palShimmer();
  }, [palActive]);

  /* ---- a Physical Quest opens with the soft "screen time paused" chime ---- */
  const questChimeRef = useRef(false);
  useEffect(() => {
    if (!isQuest || questChimeRef.current) return;
    questChimeRef.current = true;
    sfx.pause();
  }, [isQuest]);

  const boardRef = useRef<LevelDraft | null>(null);
  const handleDraft = useCallback((board: LevelDraft) => {
    boardRef.current = board;
  }, []);

  /* ---- completion: record exactly once, then celebrate ---- */
  const completedRef = useRef(false);
  const [completion, setCompletion] = useState<LevelCompletion | null>(null);
  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompletion(actions.completeLevel(profileId, levelNumber, (Date.now() - openedAt.current) / 1000));
  }, [profileId, levelNumber]);

  const [heroPop, setHeroPop] = useState<BadgeDef | null>(null);
  const handleHighFive = useCallback(() => {
    const hero = actions.recordHighFive(profileId).find((b) => b.id === HIGH_FIVE_HERO);
    if (hero) setHeroPop(hero);
  }, [profileId]);

  useEffect(() => {
    if (!heroPop) return;
    const id = setTimeout(() => setHeroPop(null), HERO_POP_MS);
    return () => clearTimeout(id);
  }, [heroPop]);

  const leavingRef = useRef(false);
  const goHome = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    goToMap();
  }, [goToMap]);

  // Save on leaving the level or backgrounding the app (one write, not one per cap). An empty board
  // forgets the draft; a finished level is cleared by completeLevel.
  const persistDraft = useCallback(() => {
    const board = boardRef.current;
    if (completedRef.current || !board) return;
    const empty = !board.misses && !board.placed?.length && !board.regrouping && !(board.rows && board.rows * (board.cols ?? 1) > 1);
    actions.saveDraft(profileId, key, empty ? null : { pal: palRef.current, board });
  }, [profileId, key]);
  useEffect(() => {
    if (backgrounded) persistDraft();
  }, [backgrounded, persistDraft]);
  useEffect(() => persistDraft, [persistDraft]);

  /* ---- daily screen time ---- */
  const celebrating = completion !== null;
  const timeUp = secondsLeft <= 0 && !celebrating;
  const ticking = !isQuest && !celebrating && !backgrounded && secondsLeft > 0;

  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => actions.tickScreenTime(1), 1000);
    return () => clearInterval(id);
  }, [ticking]);

  return {
    secondsLeft,
    isQuest,
    levelNumber,
    palActive,
    engagePal,
    handleAttempt,
    draft: saved?.board,
    handleDraft,
    completion,
    celebrating,
    timeUp,
    handleComplete,
    heroPop,
    handleHighFive,
    goHome,
  };
}
