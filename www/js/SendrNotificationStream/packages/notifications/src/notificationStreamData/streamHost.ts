import type { ComponentType, JSX, ReactNode } from "react";
import type {
  NotificationTemplateProps,
  ReportAbuseConfigResponse,
} from "../sendrNotificationStream/types/NotificationTemplateTypes";

export type StreamThumbnailType =
  | "avatarHeadshot"
  | "gameIcon"
  | "groupIcon"
  | "assetThumbnail"
  | "bundleThumbnail"
  | "gamePassIcon";

export type StreamThumbnailProps = {
  type: StreamThumbnailType;
  targetId: number;
  containerClass?: string;
  includeProfileFrame?: boolean;
};

export type ParsedDeepLink = { path: string[] };

export type StreamDeviceMeta = { isPhone: boolean; isInApp: boolean };

export type StreamTrustedFriendsModalProps = {
  userId: number;
  linkTokens?: number[];
  onClose: (isSuccess: boolean) => void;
};

export type NotificationStreamHost = {
  Thumbnail: ComponentType<StreamThumbnailProps>;
  getLocale: () => string | undefined;
  formatFullDate: (date: Date) => string;
  joinMultiplayerGame: ((rootPlaceId: number) => void) | null;
  parseDeepLink: (path: string) => ParsedDeepLink;
  navigateToDeepLink: (path: string) => Promise<boolean>;
  getReportAbuseConfig: () => Promise<ReportAbuseConfigResponse>;
  callGuacBehaviour: <T>(name: string) => Promise<T>;
  getDeviceMeta: () => StreamDeviceMeta | null;
  getCurrentUserId: () => string;
  hashStringWithSha256: (value: string) => Promise<string>;
  TrustedFriendsModal: ComponentType<StreamTrustedFriendsModalProps> | null;
  TranslationBoundary: ComponentType<{ children?: ReactNode }>;
  LegacyNotificationTemplate: ((props: NotificationTemplateProps) => JSX.Element) | null;
};

let host: NotificationStreamHost | undefined;

export const registerNotificationStreamHost = (next: NotificationStreamHost): void => {
  host = next;
};

export const getNotificationStreamHost = (): NotificationStreamHost => {
  if (host == null) {
    throw new Error("No notification stream host is registered");
  }
  return host;
};
