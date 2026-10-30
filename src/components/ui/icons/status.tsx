/**
 * Status icons — alert, clock, stopwatch, plus, lock, check, sparkle.
 */

import { Circle, Path, Rect } from "react-native-svg";

import { make } from "./make";

/* ---------------------------------------------------------------- status */

export const AlertCircleIcon = make(
  "AlertCircleIcon",
  <>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M12 7.5v5.5M12 16.4v.1" />
  </>,
);

export const ClockIcon = make(
  "ClockIcon",
  <>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M12 7.2V12l3.2 2.2" />
  </>,
);

/** Stopwatch — round face, top crown button and a side pusher. */
export const StopwatchIcon = make(
  "StopwatchIcon",
  <>
    <Circle cx="12" cy="13.5" r="7.5" />
    <Path d="M10 2.8h4M12 2.8V6M18.2 6.6l1.4-1.4M12 9.6v3.9l2.4 1.6" />
  </>,
);

export const PlusIcon = make("PlusIcon", <Path d="M12 5v14M5 12h14" />);

export const LockIcon = make(
  "LockIcon",
  <>
    <Rect x="4.5" y="10.5" width="15" height="10.5" rx="2.8" />
    <Path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    <Path d="M12 14.6v2.4" />
  </>,
);

export const CheckIcon = make("CheckIcon", <Path d="M5 12.6l4.4 4.4L19 7.4" />);

export const SparkleIcon = make(
  "SparkleIcon",
  <>
    <Path d="M11 4c.5 4.4 2 6.4 6.5 7-4.5.6-6 2.6-6.5 7-.5-4.4-2-6.4-6.5-7C9 10.4 10.5 8.4 11 4z" />
    <Path d="M18.5 2.8v3.4M16.8 4.5h3.4" />
  </>,
);
