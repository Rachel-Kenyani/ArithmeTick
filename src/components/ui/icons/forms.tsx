/**
 * Form-field icons (mail, key, eye, smile, grad cap, phone).
 */

import { Circle, Path, Rect } from "react-native-svg";

import { make } from "./make";

/* ---------------------------------------------------------------- forms */

/** Inbox tray — the mockups' "Enter Email or Phone Number" glyph. */
export const MailIcon = make(
  "MailIcon",
  <>
    <Path d="M3.5 13.5 5.9 6.6A2.4 2.4 0 0 1 8.2 5h7.6a2.4 2.4 0 0 1 2.3 1.6l2.4 6.9V17a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17z" />
    <Path d="M3.5 13.5h4.7l1.3 2.3h5l1.3-2.3h4.7" />
  </>,
);

/** Round-headed key (password fields, "Back? Log In"). */
export const KeyIcon = make(
  "KeyIcon",
  <>
    <Path d="M10.1 12.9 3.9 19.1a1.5 1.5 0 0 0-.4 1V21a.5.5 0 0 0 .5.5h2.3a.7.7 0 0 0 .7-.7v-1.3h1.6a.7.7 0 0 0 .7-.7v-1.6h1.6l1.9-1.9A6 6 0 1 0 10.1 12.9z" />
    <Path d="M16.6 7.4h.01" strokeWidth={2.6} />
  </>,
);

export const EyeIcon = make(
  "EyeIcon",
  <>
    <Path d="M2.5 12c2-4.4 5.4-6.8 9.5-6.8s7.5 2.4 9.5 6.8c-2 4.4-5.4 6.8-9.5 6.8S4.5 16.4 2.5 12z" />
    <Circle cx="12" cy="12" r="3" />
  </>,
);

export const EyeOffIcon = make(
  "EyeOffIcon",
  <>
    <Path d="M9.9 5.4A9.6 9.6 0 0 1 12 5.2c4.1 0 7.5 2.4 9.5 6.8a13 13 0 0 1-2.2 3.4M16.6 17.5A9.2 9.2 0 0 1 12 18.8c-4.1 0-7.5-2.4-9.5-6.8A12.6 12.6 0 0 1 6.6 6.8" />
    <Path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <Path d="M3.5 3.5l17 17" />
  </>,
);

/** "What's your Explorer's name?" */
export const SmileIcon = make(
  "SmileIcon",
  <>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M9 9.8h.01M15 9.8h.01" strokeWidth={2.6} />
    <Path d="M8.6 14.2a4.4 4.4 0 0 0 6.8 0" />
  </>,
);

/** Mortarboard — "Choose their Grade / Class". */
export const GradCapIcon = make(
  "GradCapIcon",
  <>
    <Path d="M12 4.5 2.5 9.3 12 14l9.5-4.7z" />
    <Path d="M6.5 11.4v4.8c0 1.6 2.5 3.3 5.5 3.3s5.5-1.7 5.5-3.3v-4.8" />
    <Path d="M21.5 9.3v5" />
  </>,
);

export const PhoneIcon = make(
  "PhoneIcon",
  <>
    <Rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
    <Path d="M10.8 18.2h2.4" />
  </>,
);
