import { Button } from "@rbx/core-ui/legacy/react-style-guide";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import playButtonConstants from "../constants/playButtonConstants";
import { translations } from "../constants/translations";

const { playButtonTextTranslationMap } = playButtonConstants;

type ValueOf<T> = T[keyof T];

export type TUnplayableProps = {
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  hideButtonText?: boolean;
};

const UnplayableButton = ({
  translate,
  iconClassName = "icon-status-unavailable-secondary",
  buttonWidth = Button.widths.full,
  buttonClassName = "btn-common-play-game-unplayable-lg",
  hideButtonText = false,
}: TUnplayableProps & {
  translate: TranslateFunction;
}) => (
  <Button
    data-testid="play-unplayable-button"
    width={buttonWidth}
    className={buttonClassName}
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
