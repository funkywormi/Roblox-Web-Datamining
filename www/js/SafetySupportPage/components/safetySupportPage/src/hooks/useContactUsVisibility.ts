import { CurrentUser } from '@rbx/core-scripts/legacy/Roblox';

/**
 * The percentage of users that can see the "Contact Us" link.
 * Since we can deploy easily we'll hardcode this value and re-deploy on changes.
 */
const CONTACT_US_ROLLOUT_PERCENTAGE = 0;

const useContactUsVisibility = (): boolean => {
  if (!CurrentUser) {
    return false;
  }
  const userId = parseInt(CurrentUser.userId, 10);
  if (!Number.isFinite(userId)) {
    return false;
  }
  /**
   * We have a pattern of using `userId % 100 < percentage` to determine if a user is in a rollout.
   * This however, always targets users in the same order which can be unfair. So we'll add an offset
   * here to target a different set of users first. This is an arbitrary/random value,
   * first value from Math.random() * 100 call */
  const offset = 32;
  return (userId + offset) % 100 < CONTACT_US_ROLLOUT_PERCENTAGE;
};

export default useContactUsVisibility;
