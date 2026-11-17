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
import "./playButton.css";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TUnplayableProps = {
  iconClassName?: string;
  buttonWidth?: TButtonWidth;
  buttonClassName?: string;
  hideButtonText?: boolean;
};

const UnplayableButton = ({
  iconClassName = "icon icon-filled-circle-slash size-400",
  buttonWidth = buttonWidths.full,
  buttonClassName = "btn-common-play-game-unplayable-lg game-play-button-unplayable-lg",
  hideButtonText = false,
}: TUnplayableProps) => {
  const translate = usePlayButtonTranslate();
  return (
    <Button
      data-testid="play-unplayable-button"
      // Transparent like core-ui's outlined unplayable button; playButton.css adds its border on
      // game-play-button-unplayable, which callers' buttonClassName can't drop.
      variant="Utility"
      style={fuiButtonStyle}
      className={classNames(
        fullWidthClassName(buttonWidth),
        "game-play-button-unplayable",
        buttonClassName,
      )}
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
