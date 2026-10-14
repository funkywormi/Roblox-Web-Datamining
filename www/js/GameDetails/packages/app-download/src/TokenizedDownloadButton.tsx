import type { MouseEvent } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import DownloadButton from "./DownloadButton";
import type { DownloadButtonProps } from "./DownloadButton";
import { downloadSourceType } from "./deferredDeeplinkConstants";
import { onAppDownloadClick } from "./resolveAppDownload";
import type { ResolvedAppDownload } from "./resolveAppDownload";
import { getDownloadLinkParams } from "./getDownloadLinkParams";

export type TokenizedDownloadButtonProps = Omit<DownloadButtonProps, "onClick"> & {
  linkId?: string;
  downloadSource?: string;
  onClick?: DownloadButtonProps["onClick"];
};

/**
 * DownloadButton variant that creates a deferred-deeplink token before navigating to a direct
 * installer download. Token creation stitches the link ID, browser tracker ID (`btId`), optional
 * auth ticket, and download source into a server-issued token that is appended to the download URL.
 * If token creation fails, navigation falls back to the original URL; store links are not intercepted.
 */
function TokenizedDownloadButton({
  linkId,
  downloadSource = downloadSourceType.Installer,
  onClick,
  ...downloadButtonProps
}: TokenizedDownloadButtonProps) {
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

  return <DownloadButton {...downloadButtonProps} onClick={handleClick} />;
}

export default TokenizedDownloadButton;
