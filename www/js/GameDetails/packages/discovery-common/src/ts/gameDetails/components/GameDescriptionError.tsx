import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import "../../../css/gameDetails/_description.scss";

type TGameDescriptionErrorProps = {
  translate: TranslateFunction;
};

const GameDescriptionError = ({ translate }: TGameDescriptionErrorProps): JSX.Element => {
  return (
    <div className="game-description-container">
      <div className="container-header">
        <h2>{translate(FeatureGameDetails.HeadingDescription)}</h2>
      </div>
      <div className="text game-description game-description-error">
        {translate(FeatureGameDetails.LabelContentFailedToLoad)}
      </div>
    </div>
  );
};
export default GameDescriptionError;
