/** Home auto-scroll: centres the stop to play (or the top when the grade is complete) once the map is laid out. */

import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent, ScrollViewInstance } from "react-native";

export function useMapAutoScroll(allDone: boolean) {
  const scrollRef = useRef<ScrollViewInstance>(null);

  // Auto-scroll: centre the stop to play (or the top when the grade is complete) once the map is laid out.
  const [regionHeight, setRegionHeight] = useState(0);
  const mapTop = useRef<number | null>(null);
  const pendingFocus = useRef<number | null>(null);
  const tryScroll = useCallback(() => {
    const y = pendingFocus.current;
    const top = mapTop.current;
    if (y === null || top === null || regionHeight <= 0) return;
    pendingFocus.current = null;
    const target = allDone ? 0 : Math.max(0, top + y + 22 - regionHeight / 2);
    scrollRef.current?.scrollTo({ y: target, animated: false });
  }, [allDone, regionHeight]);

  const handleRegionLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    setRegionHeight((prev) => (prev === h ? prev : h));
  }, []);
  const handleMapLayout = useCallback(
    (e: LayoutChangeEvent) => {
      mapTop.current = e.nativeEvent.layout.y;
      tryScroll();
    },
    [tryScroll],
  );
  const handleFocusY = useCallback(
    (y: number) => {
      pendingFocus.current = y;
      // Wait a frame so the content height includes the freshly measured map before scrolling.
      requestAnimationFrame(tryScroll);
    },
    [tryScroll],
  );

  return { scrollRef, regionHeight, handleRegionLayout, handleMapLayout, handleFocusY };
}
