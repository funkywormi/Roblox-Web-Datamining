import React from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { getInstallInstructions } from "./appDownloadService";

type Props = {
  translate: TranslateFunction;
};

function InstallInstructionsList({ translate }: Props) {
  const installInstructions = getInstallInstructions();
  return (
    <React.Fragment>
      <h3 className="text-title-large content-emphasis padding-none">
        {translate("Heading.InstallInstructions")}
      </h3>
      <ol className="navbar-download-app-instructions margin-none text-body-medium">
        {installInstructions.map(instructionKey => (
          <li
            key={instructionKey}
            className="padding-left-small"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: translate(instructionKey, {
                startBold: "<b>",
                endBold: "</b>",
              }),
            }}
          />
        ))}
      </ol>
    </React.Fragment>
  );
}

export default InstallInstructionsList;
