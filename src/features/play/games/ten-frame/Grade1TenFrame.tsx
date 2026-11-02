import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import type { TenFrameProps } from "@/types/domain";

import { CapLayer } from "./components/CapLayer";
import { DoneButton } from "./components/DoneButton";
import { EquationStrip } from "./components/EquationStrip";
import { FiveBadge } from "./components/FiveBadge";
import { TargetCard } from "./components/TargetCard";
import { TenFrameGrid } from "./components/TenFrameGrid";
import { WoodenTray } from "./components/WoodenTray";
import { ROW_SIZE, TARGET_TOP } from "./constants";
import { useBoardLayout } from "./hooks/useBoardLayout";
import { useTenFrameGame } from "./hooks/useTenFrameGame";
import { normalizeTarget } from "./logic/caps";
import { frameChrome, groupTones, slotMarkers } from "./logic/viewState";
import { styles } from "./styles";

const NONE: readonly number[] = [];

export default function Grade1TenFrame({ level, target: targetProp, palActive, onStruggle, onAttempt, onSolved, draft, onDraft, item = "cap" }: Readonly<TenFrameProps>) {
  const target = normalizeTarget(targetProp);
  const reduced = useReducedMotion();
  const { layout, geo, onLayout } = useBoardLayout();
  const { placed, solved, revealAll, draggingId, near, fx, caps, drag, checkAnswer, handleDragStart, handleNear, handleDragEnd, handleTap, fillNext } = useTenFrameGame({
    target,
    palActive,
    onSolved,
    onStruggle,
    onAttempt,
    geo,
    measured: layout.measured,
    reduced,
    draft,
    onDraft,
  });

  const L = layout;
  const count = placed.length;
  const topCount = Math.min(count, ROW_SIZE);
  const bottomCount = Math.max(0, count - ROW_SIZE);
  const topFull = count >= TARGET_TOP;
  const { rowTone, topTone } = groupTones(palActive, topFull);
  const { nextSlot, previewSlot, hintSlot } = slotMarkers(count, target, palActive, revealAll, solved, draggingId !== null, near);

  const { haloInset, badge } = frameChrome(L);
  const g = geo.grid;
  const wellsX = g.x + L.frameBorder + L.framePad;
  const wellsY = g.y + L.frameBorder + L.framePad;
  const card = geo.card;
  const eq = geo.eq;
  const tray = geo.tray;

  return (
    <View
      style={styles.root}
      onLayout={onLayout}
      testID={`g1-board-l${level ?? 0}-t${target}`}
      accessibilityLabel={`Make ${target}: ${target} counters needed, ${count} placed`}
    >
      <View style={[styles.abs, styles.center, { left: card.x, top: card.y, width: card.w, height: card.h }]}>
        <TargetCard
          variant={L.arrangement === "side" ? "side" : "pill"}
          target={target}
          placed={palActive || solved ? placed : NONE}
          topTone={topTone}
          solved={solved}
          layout={L}
        />
      </View>

      <TenFrameGrid
        layout={L}
        grid={g}
        slots={geo.slots}
        target={target}
        count={count}
        topCount={topCount}
        bottomCount={bottomCount}
        topFull={topFull}
        palActive={palActive}
        solved={solved}
        reduced={reduced}
        nextSlot={nextSlot}
        previewSlot={previewSlot}
        hintSlot={hintSlot}
        revealAll={revealAll}
        onFillNext={fillNext}
      />

      <View style={[styles.abs, styles.center, { left: eq.x, top: eq.y, width: eq.w, height: eq.h }]}>
        <EquationStrip target={target} topFull={topFull} palActive={palActive} solved={solved} layout={L} reduced={reduced} />
      </View>
      {solved ? null : (
        <View style={[styles.abs, styles.center, { left: geo.done.x, top: geo.done.y, width: geo.done.w, height: geo.done.h }]}>
          <DoneButton count={count} onPress={checkAnswer} />
        </View>
      )}

      <WoodenTray layout={L} tray={tray} homes={geo.homes} />

      <CapLayer
        placed={placed}
        solved={solved}
        fx={fx}
        caps={caps}
        drag={drag}
        handleDragStart={handleDragStart}
        handleNear={handleNear}
        handleDragEnd={handleDragEnd}
        handleTap={handleTap}
        size={L.cap}
        item={item}
        rowTone={rowTone}
        palActive={palActive}
        target={target}
        measured={L.measured}
        reduced={reduced}
      />

      {topFull ? (
        <FiveBadge
          palActive={palActive}
          compact={L.compact}
          size={badge}
          left={wellsX - haloInset - badge / 2 + 4}
          top={wellsY - haloInset - badge / 2 + 4}
        />
      ) : null}
    </View>
  );
}
