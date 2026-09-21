import React from "react";
import type { BrowserDetection } from "../types";
import BrowserStatus from "./BrowserStatus";
import SimpleNavigation from "./SimpleNavigation";

interface SupportedBrowsersContainerProps {
  readonly translate: (key: string) => string;
  readonly browserDetection: BrowserDetection;
}

function SupportedBrowsersContainer({
  translate,
  browserDetection,
}: SupportedBrowsersContainerProps): JSX.Element {
  return (
    <React.Fragment>
      <SimpleNavigation />
      <div className="supported-browsers-bg height-full">
        <div className="supported-browsers-mask height-full flex justify-center items-center text-center">
          <div>
            <span className="supported-browser-logo inline-block" />
            <BrowserStatus translate={translate} browserDetection={browserDetection} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default SupportedBrowsersContainer;
