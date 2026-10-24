/**
 * Grade 1 — "Spatial Number Composition & Ten-Frames" (native port of arithmetick/components/Grade1TenFrame.tsx)
 * Puzzle: build `target` (6–10, default 7) as 5 + (target − 5), e.g. 7 = 5 + 2.
 *
 * Interaction model
 * - 10 bottle caps (vifuniko) live in ONE absolutely-positioned overlay layer that covers the
 *   whole module. Each cap owns two shared values (x, y) = the centre point it sits on, in
 *   module-local pixels. The board lays itself out with its own maths (computeLayout + boardGeometry),
 *   so slot / tray-dimple centres are computed, never measured, and the caps spring there.
 *   Because a cap never changes parent, a drop animates from exactly where the finger
 *   let go into its slot, and drag / snap / spring-home / tap-return / compaction / PAL fly-ins
 *   are all the same primitive: "spring this cap to that centre".
 * - The drag runs on the UI thread (Gesture.Pan + Reanimated); JS only hears about pick-up,
 *   entering / leaving the grid's "near" zone, and the drop.
 * - Grid state is a single ordered list `placed` (cap ids in fill order): placed[i] sits in
 *   slot i. Fill order = ten-frame convention (top row L→R, then bottom row L→R) and stays
 *   contiguous when caps are removed (the rest compact).
 * - The equation strip uses a layout transition to reorder "5 + 2 = 7" into "7 = 5 + 2".
 */

import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import type { TenFrameProps } from "@/types/domain";

import { CapLayer } from "./components/CapLayer";
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

export default function Grade1TenFrame({ level, target: targetProp, palActive, onStruggle, onSolved }: Readonly<TenFrameProps>) {
  /** Caps to place: 5 in the top row + (target − 5) in the bottom row. */
  const target = normalizeTarget(targetProp);
  const reduced = useReducedMotion();
  const { layout, geo, onLayout } = useBoardLayout();
  const { placed, solved, draggingId, near, fx, caps, drag, handleDragStart, handleNear, handleDragEnd, handleTap, fillNext } = useTenFrameGame({
    target,
    palActive,
    onSolved,
    onStruggle,
    geo,
    measured: layout.measured,
    reduced,
  });

  /* ─────────────── derived view state ─────────────── */

  const L = layout;
  const count = placed.length;
  const topCount = Math.min(count, ROW_SIZE);
  const bottomCount = Math.max(0, count - ROW_SIZE);
  const topFull = count >= TARGET_TOP;
  const { rowTone, topTone } = groupTones(palActive, topFull);
  const { nextSlot, previewSlot, hintSlot } = slotMarkers(count, target, palActive, solved, draggingId !== null, near);

  const { haloInset, badge } = frameChrome(L);
  const g = geo.grid;
  /** Top-left of the wells (inside the frame border + padding), board coordinates. */
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
      {/* target card */}
      <View style={[styles.abs, styles.center, { left: card.x, top: card.y, width: card.w, height: card.h }]}>
        <TargetCard
          variant={L.arrangement === "side" ? "side" : "pill"}
          target={target}
          placed={placed}
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
        onFillNext={fillNext}
      />

      {/* live equation */}
      <View style={[styles.abs, styles.center, { left: eq.x, top: eq.y, width: eq.w, height: eq.h }]}>
        <EquationStrip top={topCount} bottom={bottomCount} topTone={topTone} solved={solved} layout={L} reduced={reduced} />
      </View>

      {/* wooden tray of vifuniko (decorative; the caps themselves are the accessible elements) */}
      <WoodenTray layout={L} tray={tray} homes={geo.homes} />

      {/* every cap lives in this one layer and springs between computed spots */}
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
        rowTone={rowTone}
        palActive={palActive}
        measured={L.measured}
        reduced={reduced}
      />

      {/* "5" badge on the full top row — sits above the caps */}
      {topFull ? (
        <FiveBadge
          palActive={palActive}
          compact={L.compact}
          size={badge}
          left={wellsX - haloInset - badge / 2 + 6}
          top={wellsY - haloInset - badge / 2 + 6}
        />
      ) : null}
    </View>
  );
}
