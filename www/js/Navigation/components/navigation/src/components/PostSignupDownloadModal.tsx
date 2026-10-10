import { Fragment, useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { translateHtml } from "@rbx/translation-utils";
import macAppIcon from "@rbx/branding-assets/images/app_icons/app_icon_mac_1024.svg";
import windowsAppIcon from "@rbx/branding-assets/images/app_icons/app_icon_windows_1024.svg";
import {
  InstallInstructionsList,
  MobileAppQrPanel,
  ResolvedAppDownload,
  appDownloadType,
  downloadSourceType,
  installInstructionsDelayMs,
  resolveAppDownload,
  sendPrimaryAppDownloadClickEvent,
  getDownloadLinkParams,
} from "@rbx/app-download";
import { logDownloadModalExposure, useDownloadModalIxp } from "../util/postSignupDownloadModalIxp";
import { sendSignupDownloadModalEvent } from "../util/postSignupDownloadModalEvent";
import { useAppDownloadTranslate } from "../hooks/useAppDownloadTranslate";

const headingTranslationKey = "Heading.GetTheRobloxApp";
const subtitleTranslationKey = "Description.PlayExploreBuildAndMore";
const ctaTranslationKey = "Action.GetTheApp";

function PostSignupDownloadModalContent({
  download,
  unmount,
}: {
  download: ResolvedAppDownload;
  unmount: () => void;
}) {
  const t = useTranslations("Feature.DownloadLanding");
  const tFeatures = useTranslations("CommonUI.Features");
  const translate = useAppDownloadTranslate();
  const [showInstructions, setShowInstructions] = useState(false);

  const performDownload = async () => {
    sendPrimaryAppDownloadClickEvent(download.link.name);
    if (!download.isDirectDownload) {
      return;
    }
    const params = await getDownloadLinkParams({
      linkId: window.location.href,
      downloadSource: downloadSourceType.Installer,
    });
    const url = download.href.withSearchParamsAppended(params);
    window.location.assign(url.toString());
    window.setTimeout(() => {
      setShowInstructions(true);
    }, installInstructionsDelayMs);
  };

  const isMacDownload = download.downloadType === appDownloadType.MacDirectDownload;
  const retryHref = isMacDownload ? "/download/client?os=mac" : "/download/client?os=win";
  const appIconSrc = isMacDownload ? macAppIcon : windowsAppIcon;

  return (
    <Dialog
      open
      size={showInstructions ? "Large" : "Medium"}
      isModal
      hasCloseAffordance
      closeLabel={tFeatures("Action.Close")}
      onOpenChange={unmount}
    >
      <DialogContent>
        {showInstructions ? (
          <DialogBody className="content-default">
            <div className="flex flex-col gap-xlarge padding-xlarge">
              <div className="flex flex-col gap-xsmall">
                <DialogTitle className="text-heading-medium content-emphasis padding-none">
                  {t("Heading.DownloadConfirmation")}
                </DialogTitle>
                <p className="text-body-large">
                  {t("Label.FollowInstallSteps")}{" "}
                  {translateHtml(translate, "Label.RetryDownload", [
                    {
                      opening: "startLink",
                      closing: "endLink",
                      render: text => (
                        <a href={retryHref} className="download-link-underline">
                          {text}
                        </a>
                      ),
                    },
                  ])}
                </p>
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
          </DialogBody>
        ) : (
          <Fragment>
            <DialogBody className="flex flex-col items-center gap-xlarge">
              <img src={appIconSrc} alt="" className="size-1600" />
              <div className="flex flex-col items-center gap-xsmall text-align-x-center">
                <DialogTitle className="text-heading-small padding-none">
                  {t(headingTranslationKey)}
                </DialogTitle>
                <p className="text-body-medium content-default">{t(subtitleTranslationKey)}</p>
              </div>
            </DialogBody>
            <DialogFooter className="flex">
              <Button
                variant="Emphasis"
                size="Medium"
                className="fill"
                onClick={() => {
                  performDownload().catch(() => undefined);
                }}
              >
                {t(ctaTranslationKey)}
              </Button>
            </DialogFooter>
          </Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function PostSignupDownloadModal({ unmount }: { unmount: () => void }) {
  const hasLoggedExposure = useRef(false);
  const translate = useAppDownloadTranslate();
  const { isDownloadModalEnabled, isLoading } = useDownloadModalIxp();
  const download = resolveAppDownload({ translate });
  const deviceMeta = getDeviceMeta();
  const isEligible = !isLoading && download != null && deviceMeta?.isDesktop;

  useEffect(() => {
    if (!isEligible || hasLoggedExposure.current) {
      return;
    }
    hasLoggedExposure.current = true;
    logDownloadModalExposure();
    if (isDownloadModalEnabled) {
      sendSignupDownloadModalEvent(window.location.href);
    }
  }, [isEligible, isDownloadModalEnabled]);

  return isEligible && isDownloadModalEnabled ? (
    <PostSignupDownloadModalContent download={download} unmount={unmount} />
  ) : null;
}
