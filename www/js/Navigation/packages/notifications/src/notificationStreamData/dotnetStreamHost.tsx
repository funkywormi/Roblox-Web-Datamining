import { CurrentUser, DeepLinkService, DeviceMeta, GameLauncher, Guac, Intl } from "Roblox";
import { cryptoUtil } from "core-roblox-utilities";
import { TranslationProvider, queryClient } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TrustedFriendsModal } from "@rbx/friends-common";
import {
  DefaultThumbnailSize,
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailTypes,
} from "roblox-thumbnails";
import type { ReportAbuseConfigResponse } from "../sendrNotificationStream/types/NotificationTemplateTypes";
import { translations } from "../sendrNotificationStream/components/component.json";
import { NotificationLocalizationProvider } from "../sendrNotificationStream/context/NotificationLocalizationProvider";
import LegacyNotificationTemplate from "../sendrNotificationStream/components/templates/LegacyNotificationTemplate";
import type {
  NotificationStreamHost,
  StreamThumbnailProps,
  StreamTrustedFriendsModalProps,
} from "./streamHost";

const DotnetStreamThumbnail = ({
  type,
  targetId,
  containerClass,
  includeProfileFrame,
}: StreamThumbnailProps) => (
  <Thumbnail2d
    type={ThumbnailTypes[type]}
    size={DefaultThumbnailSize}
    format={ThumbnailFormat.webp}
    targetId={targetId}
    containerClass={containerClass}
    includeProfileFrame={includeProfileFrame}
  />
);

const DotnetTrustedFriendsModal = ({
  userId,
  linkTokens,
  onClose,
}: StreamTrustedFriendsModalProps) => (
  <TranslationProvider config={translations}>
    <QueryClientProvider client={queryClient}>
      <TrustedFriendsModal open userId={userId} linkTokens={linkTokens} onClose={onClose} />
    </QueryClientProvider>
  </TranslationProvider>
);

export const dotnetNotificationStreamHost: NotificationStreamHost = {
  Thumbnail: DotnetStreamThumbnail,
  getLocale: () => {
    try {
      return new Intl().getLocale() || undefined;
    } catch {
      return undefined;
    }
  },
  formatFullDate: date => new Intl().getDateTimeFormatter().getFullDate(date),
  joinMultiplayerGame: rootPlaceId => {
    GameLauncher?.joinMultiplayerGame(rootPlaceId, true, false);
  },
  parseDeepLink: path => DeepLinkService.parseDeeplink(path),
  navigateToDeepLink: path => DeepLinkService.navigateToDeepLink(path),
  getReportAbuseConfig: () => Guac.callBehaviour<ReportAbuseConfigResponse>("report-abuse-ui"),
  callGuacBehaviour: name => Guac.callBehaviour(name),
  getDeviceMeta: () => (DeviceMeta ? DeviceMeta() : null),
  getCurrentUserId: () => CurrentUser.userId,
  hashStringWithSha256: value => cryptoUtil.hashStringWithSha256(value),
  TrustedFriendsModal: DotnetTrustedFriendsModal,
  TranslationBoundary: NotificationLocalizationProvider,
  LegacyNotificationTemplate,
};
