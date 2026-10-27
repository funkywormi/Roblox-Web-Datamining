import classNames from "classnames";
import { Button } from "@rbx/foundation-ui";
import playButtonConstants from "../constants/playButtonConstants";
import { usePlayButtonTranslate } from "../hooks/usePlayButtonTranslate";
import {
  buttonWidths,
  fuiButtonStyle,
  fullWidthClassName,
  TButtonWidth,
} from "../constants/buttonWidths";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TUnplayableProps = {
  iconClassName?: string;
  buttonWidth?: TButtonWidth;
  buttonClassName?: string;
  hideButtonText?: boolean;
};

const UnplayableButton = ({
  iconClassName = "icon-status-unavailable-secondary",
  buttonWidth = buttonWidths.full,
  buttonClassName = "btn-common-play-game-unplayable-lg",
  hideButtonText = false,
}: TUnplayableProps) => {
  const translate = usePlayButtonTranslate();
  return (
    <Button
      data-testid="play-unplayable-button"
      variant="Emphasis"
      style={fuiButtonStyle}
      className={classNames(fullWidthClassName(buttonWidth), buttonClassName)}
      isDisabled
      onClick={() => null}
    >
      <span className={iconClassName} />
      {!hideButtonText && (
        <span className="btn-text">{translate(playButtonTextTranslationMap.Unplayable)}</span>
      )}
    </Button>
  );
};

export default UnplayableButton;
