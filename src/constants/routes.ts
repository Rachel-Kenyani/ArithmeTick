/** Every screen's URL in one place. */
export const ROUTES = {
  /** Launcher: decides between splash / welcome / profiles / home. */
  root: "/",
  splash: "/splash",
  /** "Hey, Explorer! Get a Grown-up" */
  welcome: "/welcome",
  login: "/login",
  signup: "/signup",
  /** Verify Account (signup) or Verify Identity (reset) — the purpose comes from the store's `pending`. */
  verify: "/verify",
  forgotPassword: "/forgot-password", // NOSONAR route path, not a credential
  resetPassword: "/reset-password", // NOSONAR route path, not a credential
  /** "Almost Done!" — add a child profile. */
  addExplorer: "/add-explorer",
  /** "Welcome Back! Who is playing today?" */
  profiles: "/profiles",
  home: "/home",
  settings: "/settings",
  badges: "/badges",
  leaderboard: "/leaderboard",
  play: (level: number) => `/play/${level}` as const,
} as const;
