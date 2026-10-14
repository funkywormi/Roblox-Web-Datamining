import React from "react";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import environmentUrls from "@rbx/environment-urls";
import playButtonConstants from "../constants/playButtonConstants";
import { fuiButtonStyle } from "../constants/buttonWidths";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TPlayOnWebButtonProps = {
  placeId: string;
};

const PlayOnWebButtonContent = ({
  translate,
  placeId,
}: TPlayOnWebButtonProps & { translate: TranslateFunction }): React.JSX.Element => {
  return (
    <Button
      data-testid="play-on-web-button"
      as="a"
      variant="Standard"
      size="Large"
      style={fuiButtonStyle}
      className="btn-full-width btn-control-lg play-on-web-button"
      href={`${environmentUrls.playWebsite}/games/start?placeId=${placeId}`}
      target="_blank"
    >
      {translate(playButtonTextTranslationMap.PlayOnWeb) || "Play on Web"}
    </Button>
  );
};

export const PlayOnWebButton = withTranslations<TPlayOnWebButtonProps>(PlayOnWebButtonContent, [
  "Feature.ExperienceDetails",
]);

export default PlayOnWebButton;
