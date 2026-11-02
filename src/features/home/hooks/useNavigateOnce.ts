import { useCallback, useRef } from "react";
import { router, useFocusEffect } from "expo-router";

export function useNavigateOnce() {
  const leaving = useRef(false);

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
