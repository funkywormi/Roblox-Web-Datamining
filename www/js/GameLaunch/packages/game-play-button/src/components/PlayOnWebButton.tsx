import React, { useCallback } from "react";
import { Button } from "@rbx/foundation-ui";
import environmentUrls from "@rbx/environment-urls";
import { useTranslations } from "@rbx/www-common/i18n";
import playButtonConstants from "../constants/playButtonConstants";
import { fuiButtonStyle } from "../constants/buttonWidths";
import { getJoindata, sendPlayOnWebClickEvents } from "../utils/playButtonUtils";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TPlayOnWebButtonProps = {
  placeId: string;
  universeId: string;
  eventProperties?: Record<string, string | number | undefined>;
};

const PlayOnWebButton = ({
  placeId,
  universeId,
  eventProperties,
}: TPlayOnWebButtonProps): React.JSX.Element => {
  const playOnWebUrl = `${environmentUrls.playWebsite}/games/start?placeId=${placeId}`;
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const joinData = getJoindata(
        eventProperties?.launchData != null ? String(eventProperties.launchData) : undefined,
      );
      const { joinAttemptId, joinAttemptOrigin } = sendPlayOnWebClickEvents(
        placeId,
        universeId,
        eventProperties,
        joinData,
      );

      const url = new URL(playOnWebUrl);

      if (joinData.launchData) {
        url.searchParams.set("launchData", joinData.launchData);
      }
      if (joinData.eventId) {
        url.searchParams.set("eventId", joinData.eventId);
      }
      if (joinAttemptId) {
        url.searchParams.set("joinAttemptId", joinAttemptId);
      }
      if (joinAttemptOrigin != null) {
        url.searchParams.set("joinAttemptOrigin", String(joinAttemptOrigin));
      }
      window.open(url.toString(), "_blank", "noopener");
    },
    [placeId, universeId, eventProperties, playOnWebUrl],
  );

  return (
    <Button
      data-testid="play-on-web-button"
      variant="Standard"
      size="Large"
      style={fuiButtonStyle}
      className="btn-full-width btn-control-lg play-on-web-button"
      onClick={handleClick}
    >
      {tExperienceDetails.dynamic(playButtonTextTranslationMap.PlayOnWeb, undefined, "Play on Web")}
    </Button>
  );
};

export default PlayOnWebButton;
