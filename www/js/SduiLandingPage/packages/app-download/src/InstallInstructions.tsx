import {
  withTranslations,
  type TranslateFunction,
  type WithTranslationsProps,
} from "@rbx/core-scripts/react";
import { appDownloadTranslationConfig, downloadPageStrings } from "./constants";
import type { AppDownloadLink } from "./constants";
import { getInstallInstructions } from "./appDownloadService";
import "./InstallInstructions.scss";

type Props = {
  translate: TranslateFunction;
  downloadLink: AppDownloadLink;
  showQrCode?: boolean;
};

type PropsWithoutTranslate = Omit<Props, "translate">;

function InstallInstructions({ translate, downloadLink, showQrCode = true }: Props) {
  const installInstructions = getInstallInstructions();

  return (
    <div>
      <h1>{translate(downloadPageStrings.downloadConfirmationHeader)}</h1>
      <div className="instructions-description">
        <div>{translate(downloadPageStrings.followInstallStepsLabel)}</div>
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: translate(downloadPageStrings.retryDownloadLabel, {
              startLink: `<a href="${
                downloadLink.isDirectDownload ? downloadLink.href : translate(downloadLink.href)
              }">`,
              endLink: `</a>`,
            }),
          }}
        />
      </div>
      <div className="section install-instructions">
        <div className="col-xs-6">
          <div className="section-content">
            <h3>{translate(downloadPageStrings.installInstructionsHeader)}</h3>
            <ol type="1">
              {installInstructions.map(item => (
                <li key={item}>
                  <p
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: translate(item, {
                        startBold: "<b>",
                        endBold: "</b>",
                      }),
                    }}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
        {showQrCode ? (
          <div className="col-xs-6">
            <div className="section-content">
              <h3>{translate(downloadPageStrings.mobileAppDownloadOptionHeading)}</h3>
              <p className="qr-tagline">{translate(downloadPageStrings.mobileAppQrCodeLabel)}</p>
              <div className="qr-container">
                <div className="qr-code" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InstallInstructionsWithTranslationBase({
  translate,
  downloadLink,
  showQrCode,
}: PropsWithoutTranslate & WithTranslationsProps) {
  return (
    <InstallInstructions
      translate={translate}
      downloadLink={downloadLink}
      showQrCode={showQrCode}
    />
  );
}

export const InstallInstructionsWithTranslation = withTranslations(
  InstallInstructionsWithTranslationBase,
  appDownloadTranslationConfig,
);

export default InstallInstructions;
