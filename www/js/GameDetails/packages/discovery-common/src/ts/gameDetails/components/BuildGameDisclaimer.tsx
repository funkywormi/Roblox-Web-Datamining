import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { FeatureGameDetails } from "../../common/constants/translationConstants";

export type TBuildGameDisclaimerProps = {
  translate: TranslateFunction;
};

export const BuildGameDisclaimer = ({ translate }: TBuildGameDisclaimerProps): JSX.Element => {
  return (
    <p className="text-caption-body margin-none" data-testid="build-game-disclaimer">
      {translate(FeatureGameDetails.DescriptionMadeWithBuild)}
    </p>
  );
};

export default BuildGameDisclaimer;
