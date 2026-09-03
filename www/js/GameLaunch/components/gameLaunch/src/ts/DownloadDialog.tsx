import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { isMac } from "@rbx/core-scripts/meta/device";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { AppIcon } from "@rbx/branding-assets";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import "@rbx/core-types";
import {
  MobileAppQrPanel,
  resolveAppDownload,
  sendPrimaryAppDownloadClickEvent,
  useAppDownload,
} from "@rbx/app-download";
import { clientStatus } from "./api";

// TODO: could we do something better here? Not sure if this is consistent across translations.
const splitAtPeriod = (text: string) => {
  const index = text.indexOf(".");
  return index >= 0 ? (
    <React.Fragment>
      <span>{text.substring(0, index + 1)}</span>
      <span>{text.substring(index + 1)}</span>
    </React.Fragment>
  ) : (
    text
  );
};

const LINK_START_MARKER = "\x01LINK_START\x01";
const LINK_END_MARKER = "\x01LINK_END\x01";
const linkMarkerPattern = new RegExp(`${LINK_START_MARKER}|${LINK_END_MARKER}`);

const DownloadDialog = ({
  download,
  launchGame,
  unmount,
}: {
  download: () => Promise<void>;
  launchGame?: () => Promise<void>;
  unmount: () => void;
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const { translate } = useTranslation();
  const { logExposure } = useAppDownload({});
  const { isLoading } = useQuery({
    queryKey: ["client-status"],
    queryFn: async () => {
      const { status } = await clientStatus();
      if (status === "Unknown") {
        throw new Error(); // retry
      }
      unmount();
      return true;
    },
    retry: 2,
    retryDelay: 2500,
    cacheTime: 0,
  });

  if (!downloaded) {
    const title = translate(
      isLoading ? "Label.RobloxLoadingToPlay" : "Label.RobloxExciteToDownload",
    );
    return (
      <Dialog
        hasCloseAffordance
        closeLabel={translate("Action.Close")}
        isModal
        open
        size="Medium"
        onOpenChange={unmount}
      >
        <DialogContent className="download-dialog">
          <DialogBody className="flex flex-col items-center gap-xlarge">
            <AppIcon className="size-1600" />
            <DialogTitle
              className="text-heading-small padding-x-xxlarge padding-y-none text-align-x-center flex flex-col"
              aria-hidden
            >
              {isLoading ? splitAtPeriod(title) : title}
            </DialogTitle>
          </DialogBody>
          <DialogFooter className="flex">
            {isLoading ? (
              <Button variant="Emphasis" size="Medium" className="grow" isLoading />
            ) : (
              <Button
                variant="Emphasis"
                size="Medium"
                className="grow"
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={async () => {
                  try {
                    logExposure();
                    const resolvedDownload = resolveAppDownload();
                    if (resolvedDownload) {
                      sendPrimaryAppDownloadClickEvent(resolvedDownload.link.name);
                    }
                  } catch {
                    // ignore
                  }
                  setDownloaded(true);
                  await download();
                }}
              >
                {translate("Title.DownloadPage")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const macOs = isMac();
  const firstInstruction = macOs
    ? "Response.Dialog.MacFirstInstruction"
    : "Response.Dialog.WindowsFirstInstruction";
  const retryDownload = macOs
    ? getAbsoluteUrl("/download/client?os=mac")
    : getAbsoluteUrl("/download/client?os=win");

  return (
    <Dialog
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      isModal
      open
      size="Large"
      onOpenChange={unmount}
    >
      <DialogContent className="install-dialog">
        <DialogBody className="content-default">
          <div className="flex flex-col gap-xlarge padding-xlarge">
            <div className="flex flex-col gap-xsmall">
              <DialogTitle className="text-heading-medium content-emphasis padding-none">
                {translate("Heading.DownloadConfirmation")}
              </DialogTitle>
              <p
                className="text-body-large"
                // TODO: we need a better translation system
                // TODO: we should not be interpolating translated strings here
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: `${translate("Label.FollowInstallSteps")} ${translate(
                    "Label.RetryDownload",
                    {
                      startLink: `<a href="${retryDownload}" class="download-link-underline">`,
                      endLink: "</a>",
                    },
                  )}`,
                }}
              />
            </div>
            <div /> {/* Empty div to double gap (design wants super large gap) */}
            <div className="flex gap-xxlarge">
              <section className="flex flex-col fill basis-0 gap-large">
                <h3 className="text-title-large content-emphasis padding-none">
                  {translate("Heading.InstallInstructions")}
                </h3>
                <ol className="download-instructions-list flex flex-col gap-xlarge margin-none padding-left-large text-body-medium">
                  <li
                    className="padding-left-medium"
                    // TODO: we need a better translation system
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: translate(firstInstruction, {
                        startBold: "<b>",
                        endBold: "</b>",
                      }),
                    }}
                  />
                  <li
                    className="padding-left-medium"
                    // TODO: we need a better translation system
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: translate("Response.Dialog.SecondInstruction", {
                        startBold: "<b>",
                        endBold: "</b>",
                      }),
                    }}
                  />
                  <li className="padding-left-medium">
                    {translate("Response.Dialog.ThirdInstruction")}
                  </li>
                  <li className="padding-left-medium">
                    {(() => {
                      const text = translate("Response.Dialog.FourthInstruction", {
                        startLink: LINK_START_MARKER,
                        endLink: LINK_END_MARKER,
                      });
                      const parts = text.split(linkMarkerPattern);
                      if (parts.length < 3) {
                        return text;
                      }
                      const [before, linkText, after] = parts;
                      return (
                        <React.Fragment>
                          {before}
                          <button
                            type="button"
                            className="download-link-underline"
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            onClick={() => launchGame?.()}
                          >
                            {linkText}
                          </button>
                          {after}
                        </React.Fragment>
                      );
                    })()}
                  </li>
                </ol>
              </section>
              <div /> {/* Empty div to double gap (design wants super large gap) */}
              <div className="stroke-standard stroke-default" />
              <div /> {/* Empty div to double gap (design wants super large gap) */}
              <section className="flex flex-col fill basis-0 gap-xxlarge">
                <MobileAppQrPanel translate={translate} />
              </section>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDialog;
