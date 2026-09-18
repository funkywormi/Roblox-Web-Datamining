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

export type TUnplayableProps = {
  iconClassName?: string;
  buttonWidth?: TButtonWidth;
  buttonClassName?: string;
  hideButtonText?: boolean;
};

const UnplayableButton = ({
  translate,
  iconClassName = "icon-status-unavailable-secondary",
  buttonWidth = buttonWidths.full,
  buttonClassName = "btn-common-play-game-unplayable-lg",
  hideButtonText = false,
}: TUnplayableProps & {
  translate: TranslateFunction;
}) => (
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

export default withTranslations<TUnplayableProps>(UnplayableButton, translations);
