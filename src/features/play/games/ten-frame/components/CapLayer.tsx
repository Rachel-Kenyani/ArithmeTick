/**
 * The single overlay layer every cap lives in; caps spring between computed spots inside it.
 */

import { StyleSheet, View } from "react-native";

import { CAP_IDS, ROW_SIZE, TARGET_TOP } from "../constants";
import type { useTenFrameGame } from "../hooks/useTenFrameGame";
import { isSlotBelow, slotOf } from "../logic/caps";
import { styles } from "../styles";
import type { GroupTone } from "../types";
import { BottleCap } from "./BottleCap";

type Game = ReturnType<typeof useTenFrameGame>;

interface CapLayerProps
  extends Pick<Game, "placed" | "solved" | "fx" | "caps" | "drag" | "handleDragStart" | "handleNear" | "handleDragEnd" | "handleTap"> {
  size: number;
  rowTone: GroupTone;
  palActive: boolean;
  measured: boolean;
  reduced: boolean;
}

export function CapLayer({
  placed,
  solved,
  fx,
  caps,
  drag,
  handleDragStart,
  handleNear,
  handleDragEnd,
  handleTap,
  size,
  rowTone,
  palActive,
  measured,
  reduced,
}: Readonly<CapLayerProps>) {
  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.capLayer]}>
      {CAP_IDS.map((id) => {
        const inSlot = slotOf(placed, id);
        return (
          <BottleCap
            key={id}
            id={id}
            size={size}
            mv={caps[id]}
            slot={inSlot}
            group={isSlotBelow(inSlot, ROW_SIZE) ? rowTone : null}
            locked={palActive && isSlotBelow(inSlot, TARGET_TOP)}
            frozen={solved}
            visible={measured}
            fx={fx[id]}
            reduced={reduced}
            drag={drag}
            onDragStart={handleDragStart}
            onNear={handleNear}
            onDragEnd={handleDragEnd}
            onTap={handleTap}
          />
        );
      })}
    </View>
  );
}
