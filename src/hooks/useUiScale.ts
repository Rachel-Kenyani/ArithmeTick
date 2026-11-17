import { useWindowDimensions } from "react-native";

/** Below this shortest side the device is a phone and nothing is scaled. */
const TABLET_MIN_SIDE = 600;
/** The shortest side the phone layouts were designed around, plus room for margins. */
const DESIGN_SIDE = 560;
const MAX_SCALE = 1.5;

/**
 * How much to enlarge phone-sized layouts on a tablet: 1 on phones, about 1.3 on an iPad mini, 1.45 on an iPad and 1.5
 * on a Surface Pro. Based on the shortest side, so turning the tablet does not change the size of things.
 */
export function uiScaleFor(width: number, height: number): number {
  const side = Math.min(width, height);
  if (side < TABLET_MIN_SIDE) return 1;
  return Math.min(MAX_SCALE, Math.round((side / DESIGN_SIDE) * 100) / 100);
}

export function useUiScale(): number {
  const { width, height } = useWindowDimensions();
  return uiScaleFor(width, height);
}

/** The window size as a scaled layout sees it, for screens that size themselves from the window. */
export function useLayoutWindow(): { width: number; height: number; scale: number } {
  const { width, height } = useWindowDimensions();
  const scale = uiScaleFor(width, height);
  return { width: width / scale, height: height / scale, scale };
}
