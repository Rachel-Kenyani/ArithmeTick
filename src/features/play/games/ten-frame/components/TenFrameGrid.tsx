/**
 * The ten-frame itself: frame, top-row halo, PAL locked chunk and the ten wells.
 */

import { View } from "react-native";

import { colors } from "@/theme";

import { CAP_COUNT, CAP_IDS, ROW_SIZE } from "../constants";
import { frameChrome, frameColorFor, gridLabelFor, wellModeFor } from "../logic/viewState";
import { styles } from "../styles";
import type { BoardLayout, Pt, Rect4 } from "../types";
import { PopIn } from "./PopIn";
import { TopRowHalo } from "./TopRowHalo";
import { Well } from "./Well";

interface TenFrameGridProps {
  layout: BoardLayout;
  grid: Rect4;
  slots: Pt[];
  target: number;
  count: number;
  topCount: number;
  bottomCount: number;
  topFull: boolean;
  palActive: boolean;
  solved: boolean;
  reduced: boolean;
  nextSlot: number;
  previewSlot: number;
  hintSlot: number;
  onFillNext: () => void;
}

export function TenFrameGrid({
  layout: L,
  grid: g,
  slots,
  target,
  count,
  topCount,
  bottomCount,
  topFull,
  palActive,
  solved,
  reduced,
  nextSlot,
  previewSlot,
  hintSlot,
  onFillNext,
}: Readonly<TenFrameGridProps>) {
  /** Slots that stay empty once the target is reached (locked out under PAL). */
  const lockedCount = CAP_COUNT - target;
  const { cellRadius, haloInset, frameEdge } = frameChrome(L);
  const rowWidth = L.cell * ROW_SIZE + L.gap * (ROW_SIZE - 1);
  const showTopHalo = palActive || topFull;
  /** Top-left of the wells (inside the frame border + padding), board coordinates. */
  const wellsX = g.x + L.frameBorder + L.framePad;
  const wellsY = g.y + L.frameBorder + L.framePad;

  const gridLabel = gridLabelFor(topCount, bottomCount, solved, target);
  const frameColor = frameColorFor(solved, previewSlot >= 0);

  return (
    <>
      <View
        pointerEvents="none"
        style={[styles.abs, { left: g.x, top: g.y + frameEdge, width: g.w, height: g.h, borderRadius: 24, backgroundColor: solved ? "#C48A00" : colors.atInk }]}
      />
      <View
        accessible
        accessibilityLabel={gridLabel}
        pointerEvents="none"
        style={[
          styles.abs,
          styles.frame,
          { left: g.x, top: g.y, width: g.w, height: g.h, borderWidth: L.frameBorder, borderColor: frameColor },
          solved ? styles.glowYellow : null,
        ]}
      />

      {/* 5-group halo (gold) / PAL locked row glow (mint) */}
      {showTopHalo ? (
        <TopRowHalo
          palActive={palActive}
          reduced={reduced}
          left={wellsX - haloInset}
          top={wellsY - haloInset}
          width={rowWidth + haloInset * 2}
          height={L.cell + haloInset * 2}
          radius={cellRadius + haloInset + 2}
        />
      ) : null}

      {/* PAL: the slots that stay empty (10 − target, e.g. 10 − 7 = 3) are one soft yellow chunk */}
      {palActive && lockedCount > 0 ? (
        <PopIn
          from={0.94}
          delayMs={150}
          style={[
            styles.abs,
            styles.chunk,
            {
              borderWidth: L.compact ? 3 : 4,
              left: wellsX + (target - ROW_SIZE) * (L.cell + L.gap) - haloInset,
              top: wellsY + L.cell + L.gap - haloInset,
              width: lockedCount * L.cell + (lockedCount - 1) * L.gap + haloInset * 2,
              height: L.cell + haloInset * 2,
              borderRadius: cellRadius + haloInset + 2,
            },
          ]}
        />
      ) : null}

      {CAP_IDS.map((i) => (
        <Well
          key={i}
          index={i}
          x={slots[i].x}
          y={slots[i].y}
          size={L.cell}
          radius={cellRadius}
          capSize={L.cap}
          mode={wellModeFor(i, palActive, target)}
          filled={i < count}
          preview={i === previewSlot}
          hint={i === hintSlot}
          reduced={reduced}
          isNext={i === nextSlot && !solved}
          onFillNext={onFillNext}
        />
      ))}
    </>
  );
}
