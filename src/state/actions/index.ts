/**
 * All store actions, grouped by domain and merged into the single `actions` object.
 * Call them from event handlers or effects — never during render.
 */

import { accountActions } from "./account";
import { profileActions } from "./profiles";
import { progressActions } from "./progress";
import { reviewerActions } from "./reviewer";
import { screenTimeActions } from "./screenTime";

export { draftKey, type LevelCompletion } from "./progress";

export const actions = {
  ...accountActions,
  ...profileActions,
  ...progressActions,
  ...screenTimeActions,

  /* ---------------- reviewer tools ---------------- */
  ...reviewerActions,
};
