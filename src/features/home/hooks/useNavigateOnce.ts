/** One navigation per visit for the home screen (re-armed whenever the screen regains focus). */

import { useCallback, useRef } from "react";
import { router, useFocusEffect } from "expo-router";

export function useNavigateOnce() {
  const leaving = useRef(false);

  // One navigation per visit (a double tap must not push twice). The screen stays alive under the next one,
  // so re-arm it whenever it comes back into focus.
  useFocusEffect(
    useCallback(() => {
      leaving.current = false;
    }, []),
  );

  const go = useCallback((href: string) => {
    if (leaving.current) return;
    leaving.current = true;
    router.push(href as never);
  }, []);

  return go;
}
