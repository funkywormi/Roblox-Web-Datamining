import { MouseEvent, useEffect } from "react";
import DownloadButton from "@rbx/app-download/DownloadButton";
import {
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
import { useAppDownloadTranslate } from "@rbx/app-download/useAppDownloadTranslate";
import { useTopNavDownloadButton } from "../util/topNavDownloadButtonIxp";
import { getNavCapability } from "../util/navCapabilities";

export default function DownloadAppNavItem() {
  const t = useTranslations("Feature.DownloadLanding");
  const translate = useAppDownloadTranslate();
  const isEnabled = useTopNavDownloadButton();
  const download = resolveAppDownload({ translate });
  const deviceMeta = getDeviceMeta();
  const isEligible = !deviceMeta?.isPhone && !deviceMeta?.isTablet && download != null;

  // The layer allocates on exposure, so log both arms wherever the button could appear.
  useEffect(() => {
    if (isEligible) {
      // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation -- exposure logging, not a data fetch
      void getNavCapability("logTopNavDownloadExposure")?.();
    }
  }, [isEligible]);

  if (!isEnabled || !isEligible) {
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
    <li className="download-app-nav-item !padding-y-xsmall !padding-left-medium !padding-right-xsmall">
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
