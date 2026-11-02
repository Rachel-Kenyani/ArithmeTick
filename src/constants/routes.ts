export const ROUTES = {
  root: "/",
  splash: "/splash",
  welcome: "/welcome",
  login: "/login",
  signup: "/signup",
  verify: "/verify",
  forgotPassword: "/forgot-password", // NOSONAR route path, not a credential
  resetPassword: "/reset-password", // NOSONAR route path, not a credential
  addExplorer: "/add-explorer",
  profiles: "/profiles",
  home: "/home",
  settings: "/settings",
  badges: "/badges",
  leaderboard: "/leaderboard",
  play: (level: number) => `/play/${level}` as const,
} as const;
