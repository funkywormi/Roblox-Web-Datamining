import environmentUrls from "@rbx/environment-urls";

const { notificationApi } = environmentUrls;

export const PAGE_SIZE = 20;

export type StreamNotification = {
  id: string;
  notificationSourceType: string;
  eventDate: string;
  timestamp?: string;
  isInteracted?: boolean;
  isClickable?: boolean;
  eventCount?: number;
  metadataCollection?: unknown[];
  content?: Record<string, unknown> & { bundleKey?: string };
  // Present only on synthetic "SendrBundle" rows produced by grouping Sendr rows
  // that share content.bundleKey (see groupSendrBundles).
  bundleKey?: string;
  bundleId?: string;
  notifications?: StreamNotification[];
};

export const getRecentUrlConfig = (
  startIndex: number,
  maxRows: number = PAGE_SIZE,
): { url: string; withCredentials: boolean; retryable: boolean } => ({
  url: `${notificationApi}/v2/stream-notifications/get-recent?maxRows=${maxRows}&startIndex=${startIndex}`,
  withCredentials: true,
  retryable: true,
});

export const markInteractedUrlConfig: { url: string; withCredentials: boolean } = {
  url: `${notificationApi}/v2/stream-notifications/mark-interacted`,
  withCredentials: true,
};
