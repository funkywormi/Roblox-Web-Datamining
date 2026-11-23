import { getCurrentUser, userIdToNumber } from "@rbx/www-common/user";
import { window } from "@rbx/core-lib/browser";

export const getCurrentUserId = (): number | null => {
  const user = getCurrentUser();
  return user ? userIdToNumber(user.id) : null;
};

/**
 * Parses user ID from the current URL.
 * @returns {number|null} user ID.
 */
export const getUserIdFromUrl = (): number | null => {
  const pathname = window?.location.pathname ?? "";
  if (pathname.includes("users/inventory")) {
    return getCurrentUserId();
  }

  const reg = /\/users\/(\d+)\//g;
  const match = reg.exec(pathname);
  return match?.[1] ? parseInt(match[1], 10) : null;
};

export const isOwnPage = (userId: number | null): boolean =>
  userId !== null && getCurrentUserId() === userId;
