import React, { useMemo } from "react";
import {
  DownloadButton,
  InstallInstructionsList,
  MobileAppQrPanel,
  appDownloadType,
  downloadSourceType,
  resolveAppDownload,
  sendPrimaryAppDownloadClickEvent,
  useAppDownload,
  type ResolvedAppDownload,
} from "@rbx/app-download";
import { DialogTitle } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { useTopNavDownloadButton } from "../util/topNavDownloadButtonIxp";

export default function DownloadAppNavItem() {
  const { translate } = useTranslation();
  const isEnabled = useTopNavDownloadButton();
  const { resolveTokenizedHref, logExposure } = useAppDownload({
    linkId: window.location.href,
    downloadSource: downloadSourceType.Installer,
  });
  const download = useMemo(() => resolveAppDownload({ translate }), [translate]);

  if (!isEnabled) {
    return null;
  }
  const deviceMeta = getDeviceMeta();
  if (deviceMeta?.isPhone || deviceMeta?.isTablet) {
    return null;
  }
  if (!download) {
    return null;
  }

  const handleClick = async (click: ResolvedAppDownload, event: React.MouseEvent<HTMLElement>) => {
    logExposure();
    sendPrimaryAppDownloadClickEvent(click.link.name);
    if (!click.isDirectDownload) {
      return;
    }
    // Intercept anchor navigation so we can append a deferred-deeplink token.
    event.preventDefault();
    const url = await resolveTokenizedHref(click.href);
    window.location.assign(url.toString());
  };

  const retryHref =
    download.downloadType === appDownloadType.MacDirectDownload
      ? "/download/client?os=mac"
      : "/download/client?os=win";

  const installInstructions = (
    <div className="flex flex-col gap-xlarge padding-xlarge">
      <div className="flex flex-col gap-xsmall">
        <DialogTitle className="text-heading-medium content-emphasis padding-none">
          {translate("Heading.DownloadConfirmation")}
        </DialogTitle>
        <p
          className="text-body-large"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `${translate("Label.FollowInstallSteps")} ${translate("Label.RetryDownload", {
              startLink: `<a href="${retryHref}" class="download-link-underline">`,
              endLink: "</a>",
            })}`,
          }}
        />
      </div>
      <div className="flex gap-xxlarge">
        <section className="flex flex-col fill basis-0 gap-large">
          <InstallInstructionsList translate={translate} />
        </section>
        <div className="stroke-standard stroke-default" />
        <section className="flex flex-col fill basis-0 gap-xxlarge">
          <MobileAppQrPanel translate={translate} />
        </section>
      </div>
    </div>
  );

  return (
    <li className="navbar-icon-item navbar-download-app-item">
      <DownloadButton
        text={translate("Action.Download") || "Download"}
        variant="Emphasis"
        size="Small"
        className="navbar-download-app-button"
        download={download}
        renderInstallInstructions={() => installInstructions}
        onClick={handleClick}
      />
    </li>
  );
}
