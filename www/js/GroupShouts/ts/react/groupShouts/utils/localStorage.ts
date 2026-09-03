import { CurrentUser } from 'Roblox';
import { localStorageService } from 'core-roblox-utilities';

function getDismissibleShoutUpsellBannerStorageKey() {
  const userId = CurrentUser.isAuthenticated && CurrentUser.userId;
  return `Roblox.GroupAnnouncements.DismissibleShoutUpsellBanner:${userId || ''}`;
}

export function getHasOwnerDismissedUpsell(): boolean {
  const key = getDismissibleShoutUpsellBannerStorageKey();
  return !!localStorageService.getLocalStorage(key);
}

export function setOwnerHasDismissedUpsell(): void {
  const key = getDismissibleShoutUpsellBannerStorageKey();
  localStorageService.setLocalStorage(key, true);
}

function getNotificationsUpsellBannerStorageKey(groupId: number) {
  const userId = CurrentUser.isAuthenticated && CurrentUser.userId;
  return `Roblox.GroupAnnouncements.NotificationUpsellBanner:${userId || ''}:${groupId}`;
}

export function getHasUserDismissedNotificationsUpsell(groupId: number): boolean {
  const key = getNotificationsUpsellBannerStorageKey(groupId);
  return !!localStorageService.getLocalStorage(key);
}

export function setUserHasDismissedNotificationsUpsell(groupId: number): void {
  const key = getNotificationsUpsellBannerStorageKey(groupId);
  localStorageService.setLocalStorage(key, true);
}
