/**
 * Board size → responsive layout + geometry (measured with onLayout, computed with pure maths).
 */

import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

import { boardGeometry } from "../layout/boardGeometry";
import { DEFAULT_LAYOUT, computeLayout } from "../layout/computeLayout";
import { nextBox } from "../logic/viewState";

export function useBoardLayout() {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const layout = useMemo(() => (box ? computeLayout(box.w, box.h) : DEFAULT_LAYOUT), [box]);
  const geo = useMemo(() => boardGeometry(layout, box?.w ?? 336, box?.h ?? 520), [layout, box]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((prev) => nextBox(prev, width, height));
  }, []);

  return { layout, geo, onLayout };
}
