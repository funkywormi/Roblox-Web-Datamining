import classNames from "classnames";
import type { BrowserDetection } from "../types";
import browserLists from "../constants/browserLists";

interface BrowserStatusProps {
  readonly translate: (key: string) => string;
  readonly browserDetection: BrowserDetection;
}

function BrowserStatus({ translate, browserDetection }: BrowserStatusProps): JSX.Element {
  const { isUnsupportedBrowser, isWindows } = browserDetection;

  const messageOfBrowserStatus = isUnsupportedBrowser
    ? translate("Message.BrowserIsNotValid")
    : translate("Message.BrowserIsValid");
  const descriptionOfBrowserStatus = isUnsupportedBrowser
    ? translate("Description.BrowserNeedsUpdated")
    : null;

  const { validBrowsersForMac, validBrowsersForWin, browserMetaData } = browserLists;
  const validBrowsers = isWindows ? validBrowsersForWin : validBrowsersForMac;

  return (
    <div className="margin-auto text-center">
      <h2 className="margin-y-[12px] margin-x-auto">{messageOfBrowserStatus}</h2>
      {descriptionOfBrowserStatus != null && (
        <p className="content-emphasis margin-y-[12px] margin-x-auto">
          {descriptionOfBrowserStatus}
        </p>
      )}

      <ul className="browser-list margin-y-[12px] margin-x-auto">
        {validBrowsers.map(browser => {
          const meta = browserMetaData[browser];
          const iconClassNames = classNames("browser-icon inline-block", meta.iconClassName);
          const browserName = translate(meta.translationString);
          return (
            <li key={browser} className="browser-item" title={browserName}>
              <a href={meta.downloadLink} className="inline-block">
                <div className="browser-icon-container radius-medium inline-block padding-bottom-[8px]">
                  <span className={iconClassNames} />
                  <div className="margin-top-[6px] text-center">{browserName}</div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BrowserStatus;
