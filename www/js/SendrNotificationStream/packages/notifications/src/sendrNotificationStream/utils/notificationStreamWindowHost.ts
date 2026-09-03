import type { SelectedNotificationState } from "../context/SelectedNotification";
import { CLIENT_TRIGGER_TRUSTED_FRIENDS_MODAL_EVENT } from "../constants/clientTriggerConstants";
import type { TrustedFriendsAcceptModalRequestDetail } from "../clientTriggers/clientTriggerModalBridge";
import type { NotificationData } from "../types/NotificationTemplateTypes";

export type NotificationStreamAbuseReportHost = (notificationData: NotificationData) => void;

export type NotificationStreamMetaActionsHost = (
  event: CustomEvent<SelectedNotificationState>,
) => void;

export type NotificationStreamTrustedFriendsHost = (
  detail: TrustedFriendsAcceptModalRequestDetail,
) => void;

let metaActionsListenerAttached = false;
let trustedFriendsListenerAttached = false;

let notificationStreamMetaActionsHost: NotificationStreamMetaActionsHost | null = null;
let notificationStreamTrustedFriendsHost: NotificationStreamTrustedFriendsHost | null = null;
let notificationStreamAbuseReportHost: NotificationStreamAbuseReportHost | null = null;

const metaActionsWindowHandler = (event: Event): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  notificationStreamMetaActionsHost?.(event as CustomEvent<SelectedNotificationState>);
};

const trustedFriendsWindowHandler = (event: Event): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { detail } = event as CustomEvent<TrustedFriendsAcceptModalRequestDetail>;
  notificationStreamTrustedFriendsHost?.(detail);
};

function ensureMetaActionsListener(): void {
  if (metaActionsListenerAttached || typeof window === "undefined") {
    return;
  }
  window.addEventListener("setMetaActionsList", metaActionsWindowHandler);
  metaActionsListenerAttached = true;
}

function addTrustedFriendsListenerIfUnattached(): void {
  if (trustedFriendsListenerAttached || typeof window === "undefined") {
    return;
  }
  window.addEventListener(CLIENT_TRIGGER_TRUSTED_FRIENDS_MODAL_EVENT, trustedFriendsWindowHandler);
  trustedFriendsListenerAttached = true;
}

/**
 * Registers the active modal-root handler for `setMetaActionsList` window events.
 * Uses a single `window` listener for the lifetime of the page so remounts without
 * React cleanup do not accumulate listeners.
 */
export function setNotificationStreamMetaActionsHost(
  handler: NotificationStreamMetaActionsHost | null,
): void {
  ensureMetaActionsListener();
  notificationStreamMetaActionsHost = handler;
}

/**
 * Registers the active modal-root handler for trusted-friends client-trigger bridge events.
 * Uses a single `window` listener for the lifetime of the page.
 */
export function setNotificationStreamTrustedFriendsHost(
  handler: NotificationStreamTrustedFriendsHost | null,
): void {
  addTrustedFriendsListenerIfUnattached();
  notificationStreamTrustedFriendsHost = handler;
}

export function setNotificationStreamAbuseReportHost(
  handler: NotificationStreamAbuseReportHost | null,
): void {
  notificationStreamAbuseReportHost = handler;
}

export function openNotificationStreamAbuseReport(notificationData: NotificationData): void {
  notificationStreamAbuseReportHost?.(notificationData);
}
