/**
 * Navigation icons — chevrons, arrows and the route glyph.
 */

import { Circle, Path } from "react-native-svg";

import { make } from "./make";

/* ---------------------------------------------------------------- arrows */

export const ChevronLeftIcon = make("ChevronLeftIcon", <Path d="M14.5 6 8.5 12l6 6" />);
export const ChevronRightIcon = make("ChevronRightIcon", <Path d="M9.5 6l6 6-6 6" />);
export const ChevronDownIcon = make("ChevronDownIcon", <Path d="M6 9.5l6 6 6-6" />);
export const ArrowRightIcon = make("ArrowRightIcon", <Path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />);

/** Two stops joined by a winding trail — the "I'm New Here!" glyph. */
export const RouteIcon = make(
  "RouteIcon",
  <>
    <Circle cx="5" cy="5" r="2.2" />
    <Circle cx="19" cy="19" r="2.2" />
    <Path d="M7.2 5h7.3a2.2 2.2 0 0 1 1.7 3.6L7.8 15.4A2.2 2.2 0 0 0 9.5 19h7.3" />
  </>,
);
