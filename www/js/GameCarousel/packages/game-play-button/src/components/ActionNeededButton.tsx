import React from "react";
import classNames from "classnames";
import { Button } from "@rbx/foundation-ui";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import playButtonConstants from "../constants/playButtonConstants";
import { translations } from "../constants/translations";
import {
  buttonWidths,
  fuiButtonStyle,
  fullWidthClassName,
  TButtonWidth,
} from "../constants/buttonWidths";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TActionNeededProps = {
  onButtonClick: (e: React.MouseEvent) => void;
  buttonWidth?: TButtonWidth;
  buttonClassName?: string;
};

const ActionNeededButton = ({
  onButtonClick,
  buttonWidth = buttonWidths.full,
  buttonClassName = "btn-common-play-game-action-needed-lg",
  translate,
}: TActionNeededProps & {
  translate: TranslateFunction;
}) => (
  <React.Fragment>
    <Button
      data-testid="play-action-needed-button"
      variant="Emphasis"
      style={fuiButtonStyle}
      className={classNames(fullWidthClassName(buttonWidth), buttonClassName)}
      onClick={onButtonClick}
    >
      {translate(playButtonTextTranslationMap.Unlock)}
    </Button>
    <div id="access-management-upsell-container-v1" />
  </React.Fragment>
);

export default withTranslations<TActionNeededProps>(ActionNeededButton, translations);
