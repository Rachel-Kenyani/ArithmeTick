import { useEffect, useState } from "react";

export function useCountdown(lifetimeSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(lifetimeSeconds);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const deadline = Date.now() + lifetimeSeconds * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [round, lifetimeSeconds]);

  const restart = () => {
    setRound((n) => n + 1);
    setSecondsLeft(lifetimeSeconds);
  };

  return { secondsLeft, restart };
}
