import { getCurrentUser, userIdToNumber } from '@rbx/www-common/user';

// Same contract as `@rbx/core-scripts/meta/user`, read through www-common so it also works on Next.js.
export const isAuthenticated = (): boolean => getCurrentUser() != null;

export const isPremiumUser = (): boolean => getCurrentUser()?.isPremiumUser ?? false;

export const userId = (): number | null => {
  const id = getCurrentUser()?.id;
  return id == null ? null : userIdToNumber(id);
};
