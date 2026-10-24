/** Reports the stop to play to the screen once, on the map's first measured layout. */

import { useEffect, useRef } from "react";

export function useReportFocus(focusY: number | null, onFocusY: ((y: number) => void) | undefined) {
  const reportFocus = useRef(onFocusY);
  useEffect(() => {
    reportFocus.current = onFocusY;
  }, [onFocusY]);
  const didReport = useRef(false);
  useEffect(() => {
    if (focusY === null || didReport.current) return;
    didReport.current = true;
    reportFocus.current?.(focusY);
  }, [focusY]);
}
