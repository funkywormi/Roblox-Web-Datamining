import { getCurrentUser, userIdToNumber } from "@rbx/www-common/user";

export const getCurrentUserId = (): number | null => {
  const user = getCurrentUser();
  return user ? userIdToNumber(user.id) : null;
};
