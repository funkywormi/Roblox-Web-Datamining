import { useCallback, useMemo } from "react";
import environmentUrls from "@rbx/environment-urls";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { WAIT_BEFORE_NAVIGATING_TO_STORE_MS } from "../constants";

export type UseDownloadLinkResult = {
  protocolUrl: string;
  storeFallbackUrl: string;
  launchApp: () => void;
};

// Device detection differs per host: .NET has window.Roblox (getDeviceMeta), Next has
// neither that nor the client-device DOM blob. Precedence: server-resolved OS (Next w/
// edge headers) > getDeviceMeta (.NET) > userAgent (Next client, incl. local dev where
// no header is injected).
export type UseDownloadLinkOptions = {
  operatingSystem?: string | null;
};

export const useDownloadLink = ({
  operatingSystem,
}: UseDownloadLinkOptions = {}): UseDownloadLinkResult => {
  const deviceInfo = getDeviceMeta();
  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const isIosDevice =
    operatingSystem != null
      ? operatingSystem === "iOS"
      : (deviceInfo?.isIosDevice ?? /iPad|iPhone|iPod/.test(userAgent));
  const isAndroidDevice =
    operatingSystem != null
      ? operatingSystem === "Android"
      : (deviceInfo?.isAndroidDevice ?? userAgent.includes("Android"));
  const storeFallbackUrl = isIosDevice
    ? environmentUrls.iosAppStoreLink
    : isAndroidDevice
      ? environmentUrls.googlePlayStoreLink
      : environmentUrls.appProtocolUrl;
  const protocolUrl = environmentUrls.appProtocolUrl;

  const launchApp = useCallback(() => {
    setTimeout(() => {
      if (document.hasFocus()) {
        window.location.href = storeFallbackUrl;
      }
    }, WAIT_BEFORE_NAVIGATING_TO_STORE_MS);
  }, [storeFallbackUrl]);

  return useMemo(
    () => ({ protocolUrl, storeFallbackUrl, launchApp }),
    [launchApp, protocolUrl, storeFallbackUrl],
  );
};
