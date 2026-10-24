/**
 * App-chrome and quest icons — home, speaker, pause/play, logout, leaf, hand.
 */

import { Path, Rect } from "react-native-svg";

import { make } from "./make";

/* ---------------------------------------------------------------- app chrome */

export const HomeIcon = make(
  "HomeIcon",
  <>
    <Path d="M3.5 11 12 3.8l8.5 7.2" />
    <Path d="M5.8 9.3v9.4a1.3 1.3 0 0 0 1.3 1.3H10v-5h4v5h2.9a1.3 1.3 0 0 0 1.3-1.3V9.3" />
  </>,
);

export const SpeakerIcon = make(
  "SpeakerIcon",
  <>
    <Path d="M4.5 9.2h3.1l4.4-3.8a.6.6 0 0 1 1 .5v12.2a.6.6 0 0 1-1 .5l-4.4-3.8H4.5a1 1 0 0 1-1-1v-3.6a1 1 0 0 1 1-1z" />
    <Path d="M16.2 9.2a4 4 0 0 1 0 5.6M19 6.5a7.8 7.8 0 0 1 0 11" />
  </>,
);

export const SpeakerOffIcon = make(
  "SpeakerOffIcon",
  <>
    <Path d="M4.5 9.2h3.1l4.4-3.8a.6.6 0 0 1 1 .5v12.2a.6.6 0 0 1-1 .5l-4.4-3.8H4.5a1 1 0 0 1-1-1v-3.6a1 1 0 0 1 1-1z" />
    <Path d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
  </>,
);

export const PauseIcon = make(
  "PauseIcon",
  <>
    <Rect x="6" y="5" width="4" height="14" rx="1.4" />
    <Rect x="14" y="5" width="4" height="14" rx="1.4" />
  </>,
);

export const PlayIcon = make(
  "PlayIcon",
  <Path d="M7.5 5.4v13.2a1 1 0 0 0 1.5.9l10.5-6.6a1 1 0 0 0 0-1.8L9 4.5a1 1 0 0 0-1.5.9z" />,
);

export const LogoutIcon = make(
  "LogoutIcon",
  <>
    <Path d="M14 8V6.2A2.2 2.2 0 0 0 11.8 4H6.2A2.2 2.2 0 0 0 4 6.2v11.6A2.2 2.2 0 0 0 6.2 20h5.6a2.2 2.2 0 0 0 2.2-2.2V16" />
    <Path d="M9.5 12h11M17.5 9l3 3-3 3" />
  </>,
);

/* ---------------------------------------------------------------- quests */

export const LeafIcon = make(
  "LeafIcon",
  <>
    <Path d="M19.8 4.2C11.6 4 5.8 7.6 5.8 14c0 1.6.4 2.9 1 4 1.1.6 2.4 1 4 1 6.4 0 9.7-6.4 9-14.8z" />
    <Path d="M3.8 20.2 14.4 9.6" />
  </>,
);

/** Open hand — high-fives and hands-on Physical Quests. */
export const HandIcon = make(
  "HandIcon",
  <Path d="M8 13V5.6a1.5 1.5 0 0 1 3 0V11.5M11 11.5V4a1.5 1.5 0 0 1 3 0v7.5M14 11.5V5.6a1.5 1.5 0 0 1 3 0v6.4M17 8.6a1.5 1.5 0 0 1 3 0v6.6a6.8 6.8 0 0 1-6.8 6.8h-1.4a6.6 6.6 0 0 1-5.5-3L3.5 15a1.7 1.7 0 0 1 2.6-2.1L8 15" />,
);
