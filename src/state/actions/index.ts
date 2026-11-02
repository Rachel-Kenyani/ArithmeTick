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

  ...reviewerActions,
};
