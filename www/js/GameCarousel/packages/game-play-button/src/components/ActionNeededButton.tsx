import React from "react";
import { Button } from "@rbx/core-ui/legacy/react-style-guide";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import playButtonConstants from "../constants/playButtonConstants";
import { translations } from "../constants/translations";

const { playButtonTextTranslationMap } = playButtonConstants;

type ValueOf<T> = T[keyof T];

export type TActionNeededProps = {
  onButtonClick: (e: React.MouseEvent) => void;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
};

const ActionNeededButton = ({
  onButtonClick,
  buttonWidth = Button.widths.full,
  buttonClassName = "btn-common-play-game-action-needed-lg",
  translate,
}: TActionNeededProps & {
  translate: TranslateFunction;
}) => (
  <React.Fragment>
    <Button
      data-testid="play-action-needed-button"
      width={buttonWidth}
      className={buttonClassName}
      onClick={onButtonClick}
    >
      {translate(playButtonTextTranslationMap.Unlock)}
    </Button>
    <div id="access-management-upsell-container-v1" />
  </React.Fragment>
);

export default withTranslations<TActionNeededProps>(ActionNeededButton, translations);
