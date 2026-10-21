import type { ValueOf } from "@rbx/core-types";
import { AnyUrl } from "@rbx/core-lib/url/any";
import { appDownloadLinkConstants, appDownloadType } from "./constants";
import type { AppDownloadLink } from "./constants";
import {
  getRecommendedAppDownloadType,
  getUserAgent,
  sendPrimaryAppDownloadClickEvent,
} from "./appDownloadService";

export type AppDownloadType = ValueOf<typeof appDownloadType>;

export type ResolvedAppDownload = {
  downloadType: AppDownloadType;
  link: AppDownloadLink;
  isDirectDownload: boolean;
  href: AnyUrl;
  icon: string;
  legacyIcon: string;
};

export type ResolveAppDownloadOptions = {
  downloadTypeOverride?: AppDownloadType | string;
  translate?: (key: string, params?: Record<string, unknown>) => string;
};

export type AppDownloadClickOptions = {
  source?: string;
};

const isAppDownloadType = (value: number): value is AppDownloadType =>
  Object.values(appDownloadType).some(downloadType => downloadType === value);

const normalizeDownloadTypeOverride = (
  downloadTypeOverride?: AppDownloadType | string,
): AppDownloadType | undefined => {
  if (downloadTypeOverride == null) {
    return undefined;
  }

  if (typeof downloadTypeOverride === "number") {
    return isAppDownloadType(downloadTypeOverride) && appDownloadLinkConstants[downloadTypeOverride]
      ? downloadTypeOverride
      : undefined;
  }

  const enumValue = (appDownloadType as Record<string, AppDownloadType>)[downloadTypeOverride];
  if (enumValue != null && appDownloadLinkConstants[enumValue]) {
    return enumValue;
  }

  const numericValue = Number(downloadTypeOverride);
  if (
    Number.isInteger(numericValue) &&
    isAppDownloadType(numericValue) &&
    appDownloadLinkConstants[numericValue]
  ) {
    return numericValue;
  }

  return undefined;
};

export const resolveAppDownload = ({
  downloadTypeOverride,
  translate,
}: ResolveAppDownloadOptions = {}): ResolvedAppDownload | undefined => {
  const downloadType =
    normalizeDownloadTypeOverride(downloadTypeOverride) ??
    getRecommendedAppDownloadType(getUserAgent());
  const link = appDownloadLinkConstants[downloadType];

  if (!link) {
    return undefined;
  }

  const hrefValue = link.isDirectDownload ? link.href : (translate?.(link.href) ?? link.href);
  const href = AnyUrl.parse(hrefValue);
  if (href.isErr()) {
    return undefined;
  }

  return {
    downloadType,
    link,
    isDirectDownload: link.isDirectDownload,
    href: href.value,
    icon: link.icon,
    legacyIcon: link.legacyIcon,
  };
};

export const onAppDownloadClick = (
  download: ResolvedAppDownload,
  _options?: AppDownloadClickOptions,
) => {
  sendPrimaryAppDownloadClickEvent(download.link.name);
};
