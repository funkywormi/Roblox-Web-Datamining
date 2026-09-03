import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { translateHtml } from "@rbx/translation-utils";
import macAppIcon from "@rbx/branding-assets/images/app_icons/app_icon_mac_1024.svg";
import windowsAppIcon from "@rbx/branding-assets/images/app_icons/app_icon_windows_1024.svg";
import {
  InstallInstructionsList,
  MobileAppQrPanel,
  appDownloadType,
  downloadSourceType,
  installInstructionsDelayMs,
  resolveAppDownload,
  sendPrimaryAppDownloadClickEvent,
  useAppDownload,
} from "@rbx/app-download";
import { useDownloadModalIxp } from "../util/postSignupDownloadModalIxp";
import { sendSignupDownloadModalEvent } from "../util/postSignupDownloadModalEvent";

const headingTranslationKey = "Heading.GetTheRobloxApp";
const subtitleTranslationKey = "Description.PlayExploreBuildAndMore";
const ctaTranslationKey = "Action.GetTheApp";

export const newUserSessionStorageKey = "new-user";
export const newUserSessionStorageValue = "true";

const consumeNewUserFlag = (): boolean => {
  const isNewUser =
    window.sessionStorage.getItem(newUserSessionStorageKey) === newUserSessionStorageValue;
  if (isNewUser) {
    window.sessionStorage.removeItem(newUserSessionStorageKey);
  }
  return isNewUser;
};

export default function PostSignupDownloadModal() {
  const { translate } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const hasLoggedExposure = useRef(false);
  const [isNewUser] = useState(consumeNewUserFlag);

  const { isDownloadModalEnabled, isLoading } = useDownloadModalIxp();
  const { resolveTokenizedHref, logExposure } = useAppDownload({
    linkId: window.location.href,
    downloadSource: downloadSourceType.Installer,
  });
  const download = useMemo(() => resolveAppDownload({ translate }), [translate]);

  const deviceMeta = getDeviceMeta();
  const isEligible =
    isNewUser && !isLoading && download != null && !deviceMeta?.isPhone && !deviceMeta?.isTablet;

  useEffect(() => {
    if (!isEligible || hasLoggedExposure.current) {
      return;
    }
    hasLoggedExposure.current = true;
    logExposure();
    if (isDownloadModalEnabled) {
      setOpen(true);
      sendSignupDownloadModalEvent(window.location.href);
    }
  }, [isEligible, isDownloadModalEnabled, logExposure]);

  if (!open || download == null) {
    return null;
  }

  const handleGetApp = async (): Promise<void> => {
    sendPrimaryAppDownloadClickEvent(download.link.name);
    if (!download.isDirectDownload) {
      return;
    }
    const url = await resolveTokenizedHref(download.href);
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
      open={open}
      size={showInstructions ? "Large" : "Medium"}
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      onOpenChange={() => {
        setOpen(false);
      }}
    >
      <DialogContent>
        {showInstructions ? (
          <DialogBody className="content-default">
            <div className="flex flex-col gap-xlarge padding-xlarge">
              <div className="flex flex-col gap-xsmall">
                <DialogTitle className="text-heading-medium content-emphasis padding-none">
                  {translate("Heading.DownloadConfirmation")}
                </DialogTitle>
                <p className="text-body-large">
                  {translate("Label.FollowInstallSteps")}{" "}
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
                  {translate(headingTranslationKey)}
                </DialogTitle>
                <p className="text-body-medium content-default">
                  {translate(subtitleTranslationKey)}
                </p>
              </div>
            </DialogBody>
            <DialogFooter className="flex">
              <Button
                variant="Emphasis"
                size="Medium"
                className="fill"
                onClick={() => {
                  handleGetApp().catch(() => undefined);
                }}
              >
                {translate(ctaTranslationKey)}
              </Button>
            </DialogFooter>
          </Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
}
