import localStorageService from "@rbx/core-scripts/local-storage";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { userCacheKey } from "../constants/cacheConstants";
import layoutConstants from "../constants/layoutConstants";
import { sendCacheUserChangedAuthClientErrorEvent } from "../services/eventService";

const { loginEvent, signupEvent } = layoutConstants;

export const cacheUserId = () => {
  const currentUserId = authenticatedUser()?.id?.toString() ?? null;
  let cachedUserId: string | null = null;
  try {
    const cached = localStorageService.getLocalStorage(userCacheKey) ?? null;
    if (typeof cached === "string") {
      cachedUserId = cached;
    }
  } catch {
    // ignore error
  }
  if (cachedUserId != null && currentUserId != null && cachedUserId !== currentUserId) {
    sendCacheUserChangedAuthClientErrorEvent(
      `${currentUserId},${cachedUserId}`,
      window.location.href,
    );
  }
  localStorageService.setLocalStorage(userCacheKey, currentUserId);

  // listen for login event
  window.addEventListener(loginEvent.name, e => {
    const { userId } = (e as unknown as { detail: { userId?: string } }).detail;
    if (userId != null) {
      localStorageService.setLocalStorage(userCacheKey, userId);
    }
  });

  // listen for signup event
  window.addEventListener(signupEvent.name, e => {
    const { userId } = (e as unknown as { detail: { userId?: string } }).detail;
    if (userId != null) {
      localStorageService.setLocalStorage(userCacheKey, userId);
    }
  });
};
