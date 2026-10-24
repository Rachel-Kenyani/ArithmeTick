/**
 * Reward icons — star, trophy, medal, users.
 */

import { Circle, Path } from "react-native-svg";

import { make } from "./make";

/* ---------------------------------------------------------------- rewards */

/** Rounded 5-point star (pass fill="currentColor" for the solid version). */
export const StarIcon = make(
  "StarIcon",
  <Path d="M12 3.3l2.6 5.3 5.8.9a.4.4 0 0 1 .2.7l-4.2 4.1 1 5.8a.4.4 0 0 1-.6.4L12 17.8l-5.2 2.7a.4.4 0 0 1-.6-.4l1-5.8L3 10.2a.4.4 0 0 1 .2-.7l5.8-.9z" />,
);

export const TrophyIcon = make(
  "TrophyIcon",
  <>
    <Path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z" />
    <Path d="M7.5 6H5a1 1 0 0 0-1 1v.8A3.7 3.7 0 0 0 7.7 11.5M16.5 6H19a1 1 0 0 1 1 1v.8a3.7 3.7 0 0 1-3.7 3.7" />
    <Path d="M12 14v3.3M8.5 20.5h7M9.6 20.5l.7-3.2h3.4l.7 3.2" />
  </>,
);

export const MedalIcon = make(
  "MedalIcon",
  <>
    <Path d="M7 2.8 10.4 9M17 2.8 13.6 9M7 2.8h10" />
    <Circle cx="12" cy="15" r="6.2" />
    <Path d="M12 12.1l.95 1.9 2.1.3-1.5 1.5.35 2.1-1.9-1-1.9 1 .35-2.1-1.5-1.5 2.1-.3z" strokeWidth={1.5} />
  </>,
);

export const UsersIcon = make(
  "UsersIcon",
  <>
    <Circle cx="9" cy="8" r="3.6" />
    <Path d="M2.8 20v-.6A5.4 5.4 0 0 1 8.2 14h1.6a5.4 5.4 0 0 1 5.4 5.4v.6" />
    <Path d="M15.6 4.5a3.6 3.6 0 0 1 0 7M18.2 14.3a5.4 5.4 0 0 1 3 4.9v.8" />
  </>,
);
