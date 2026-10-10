import { MouseEvent } from "react";
import {
  DownloadButton,
  InstallInstructionsList,
  MobileAppQrPanel,
  appDownloadType,
  downloadSourceType,
  resolveAppDownload,
  sendPrimaryAppDownloadClickEvent,
  getDownloadLinkParams,
  type ResolvedAppDownload,
} from "@rbx/app-download";
import { DialogTitle } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { useTopNavDownloadButton } from "../util/topNavDownloadButtonIxp";
import { useAppDownloadTranslate } from "../hooks/useAppDownloadTranslate";

export default function DownloadAppNavItem() {
  const t = useTranslations("Feature.DownloadLanding");
  const translate = useAppDownloadTranslate();
  const isEnabled = useTopNavDownloadButton();
  const download = resolveAppDownload({ translate });

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

  const handleClick = async (click: ResolvedAppDownload, event: MouseEvent<HTMLElement>) => {
    sendPrimaryAppDownloadClickEvent(click.link.name);
    if (!click.isDirectDownload) {
      return;
    }
    // Intercept anchor navigation so we can append a deferred-deeplink token.
    event.preventDefault();
    const params = await getDownloadLinkParams({
      linkId: window.location.href,
      downloadSource: downloadSourceType.Installer,
    });
    const url = click.href.withSearchParamsAppended(params);
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
          {t("Heading.DownloadConfirmation")}
        </DialogTitle>
        <p
          className="text-body-large"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `${t("Label.FollowInstallSteps")} ${t("Label.RetryDownload", {
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
    <li className="!padding-y-xsmall !padding-left-xsmall !padding-right-medium">
      <DownloadButton
        text={t.has("Action.Download") ? t("Action.Download") : "Download"}
        variant="Emphasis"
        size="Small"
        download={download}
        renderInstallInstructions={() => installInstructions}
        onClick={handleClick}
      />
    </li>
  );
}
