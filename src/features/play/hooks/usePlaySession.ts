/**
 * usePlaySession — one level's state and effects: stealth PAL, quest chime, completion (recorded once),
 * the High-Five Hero pop, leaving for the map and the daily screen-time tick.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AppState } from "react-native";

import useGoToMap from "@/features/play/hooks/useGoToMap";
import { isMuted, sfx, subscribeMuted } from "@/services/audio";
import type { BadgeDef } from "@/data/badges";
import type { LevelDef } from "@/data/levels";
import type { ChildProfile } from "@/types/models";
import { actions, useScreenTimeRemaining, type LevelCompletion } from "@/state/store";

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
  const muted = useSyncExternalStore(subscribeMuted, isMuted);
  const backgrounded = useSyncExternalStore(subscribeAppState, isBackgrounded);
  const secondsLeft = useScreenTimeRemaining();
  const goToMap = useGoToMap();

  const isQuest = level.kind === "quest";
  const profileId = profile.id;
  const levelNumber = level.number;

  /* ---- stealth PAL: off at the start of every level; flips true once and stays true ---- */
  const [palActive, setPalActive] = useState(false);
  const engagePal = useCallback(() => setPalActive(true), []);

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

  /* ---- completion: record exactly once, then celebrate ---- */
  const completedRef = useRef(false);
  const [completion, setCompletion] = useState<LevelCompletion | null>(null);
  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompletion(actions.completeLevel(profileId, levelNumber));
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
    muted,
    secondsLeft,
    isQuest,
    levelNumber,
    palActive,
    engagePal,
    completion,
    celebrating,
    timeUp,
    handleComplete,
    heroPop,
    handleHighFive,
    goHome,
  };
}
