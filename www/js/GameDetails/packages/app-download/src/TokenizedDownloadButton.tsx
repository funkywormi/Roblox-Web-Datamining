import type { MouseEvent } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import DownloadButton from "./DownloadButton";
import type { DownloadButtonProps } from "./DownloadButton";
import { downloadSourceType } from "./deferredDeeplinkConstants";
import { onAppDownloadClick, resolveAppDownload } from "./resolveAppDownload";
import type { ResolvedAppDownload } from "./resolveAppDownload";
import { getDownloadLinkParams } from "./getDownloadLinkParams";
import { buildMobileStoreOneLink, type AppsFlyerDownloadParams } from "./mobileStoreOneLink";
import { useAppDownloadTranslate } from "./useAppDownloadTranslate";

export type { AppsFlyerDownloadParams };

export type TokenizedDownloadButtonProps = Omit<DownloadButtonProps, "onClick"> & {
  linkId?: string;
  downloadSource?: string;
  onClick?: DownloadButtonProps["onClick"];
  appsFlyerParams?: AppsFlyerDownloadParams;
};

function resolveTokenizedDownloadHref(
  download: ResolvedAppDownload,
  href: DownloadButtonProps["href"],
  appsFlyerParams?: AppsFlyerDownloadParams,
): DownloadButtonProps["href"] {
  if (download.isDirectDownload) {
    return href;
  }

  return buildMobileStoreOneLink(appsFlyerParams, download);
}

function resolveTokenizedDownloadTarget(
  download: ResolvedAppDownload,
  target: DownloadButtonProps["target"],
): DownloadButtonProps["target"] {
  return download.isDirectDownload ? target : "_self";
}

/**
 * DownloadButton variant that creates a deferred-deeplink token before navigating to a direct
 * installer download. Token creation stitches the link ID, browser tracker ID (`btId`), optional
 * auth ticket, and download source into a server-issued token that is appended to the download URL.
 * If token creation fails, navigation falls back to the original URL.
 * Apple, Google Play, and Amazon clicks use an AppsFlyer OneLink as the anchor href
 * and are not intercepted. Amazon clicks also set `af_android_url` to the Amazon
 * Appstore link so the OneLink does not send Fire tablets to Google Play.
 */
function TokenizedDownloadButton({
  linkId,
  downloadSource = downloadSourceType.Installer,
  onClick,
  appsFlyerParams,
  ...downloadButtonProps
}: TokenizedDownloadButtonProps) {
  const translate = useAppDownloadTranslate();
  const handleClick = async (
    download: ResolvedAppDownload,
    event: MouseEvent<HTMLElement>,
  ): Promise<void> => {
    if (download.isDirectDownload) {
      event.preventDefault();
    }

    if (onClick) {
      await onClick(download, event);
    } else {
      onAppDownloadClick(download);
    }

    if (!download.isDirectDownload) {
      return;
    }

    const resolvedLinkId = linkId ?? browserWindow?.location.href;
    const params = await getDownloadLinkParams({ linkId: resolvedLinkId, downloadSource });
    const url = download.href.withSearchParamsAppended(params);
    window.location.assign(url.toString());
  };

  const download =
    downloadButtonProps.download ??
    resolveAppDownload({
      downloadTypeOverride: downloadButtonProps.downloadTypeOverride,
      translate,
    });

  if (!download) {
    return null;
  }

  return (
    <DownloadButton
      {...downloadButtonProps}
      download={download}
      href={resolveTokenizedDownloadHref(download, downloadButtonProps.href, appsFlyerParams)}
      target={resolveTokenizedDownloadTarget(download, downloadButtonProps.target)}
      onClick={handleClick}
    />
  );
}

export default TokenizedDownloadButton;
