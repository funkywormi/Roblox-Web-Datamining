import React from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import qrCode from "./images/install-app-qr-code.png";

type Props = {
  translate: TranslateFunction;
};

function MobileAppQrPanel({ translate }: Props) {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-small">
        <h3 className="text-label-large content-emphasis padding-none">
          {translate("Heading.MobileAppDownloadOption")}
        </h3>
        <p className="text-body-medium">{translate("Label.MobileAppQrCode")}</p>
      </div>
      <div className="flex grow justify-center items-center bg-shift-100 radius-medium padding-x-large">
        <div className="radius-medium padding-small bg-[white]">
          <img className="size-2100" src={qrCode} alt="" />
        </div>
      </div>
    </React.Fragment>
  );
}

export default MobileAppQrPanel;
