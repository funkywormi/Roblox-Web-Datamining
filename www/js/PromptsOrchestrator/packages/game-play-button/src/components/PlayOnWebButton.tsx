import React from "react";
import { Button } from "@rbx/foundation-ui";
import environmentUrls from "@rbx/environment-urls";
import { useTranslations } from "@rbx/www-common/i18n";
import playButtonConstants from "../constants/playButtonConstants";
import { fuiButtonStyle } from "../constants/buttonWidths";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TPlayOnWebButtonProps = {
  placeId: string;
};

export const PlayOnWebButton = ({ placeId }: TPlayOnWebButtonProps): React.JSX.Element => {
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");
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
      {tExperienceDetails.dynamic(playButtonTextTranslationMap.PlayOnWeb, undefined, "Play on Web")}
    </Button>
  );
};

export default PlayOnWebButton;
