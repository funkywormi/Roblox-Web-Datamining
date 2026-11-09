import React, { useCallback, useRef } from "react";
import { Button } from "@rbx/foundation-ui";
import environmentUrls from "@rbx/environment-urls";
import { WASM_HASH_PARAM } from "@rbx/wasm-hash";
import { useTranslations } from "@rbx/www-common/i18n";
import playButtonConstants from "../constants/playButtonConstants";
import { fuiButtonStyle } from "../constants/buttonWidths";
import { getJoindata, sendPlayOnWebClickEvents } from "../utils/playButtonUtils";
import { firePlayOnWebClickCounter } from "../utils/playOnWebTelemetryCounters";
import usePlayOnWebImpression from "../hooks/usePlayOnWebImpression";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TPlayOnWebButtonProps = {
  placeId: string;
  universeId: string;
  eventProperties?: Record<string, string | number | undefined>;
  wasmJoinId?: string;
};

const PlayOnWebButton = ({
  placeId,
  universeId,
  eventProperties,
  wasmJoinId,
}: TPlayOnWebButtonProps): React.JSX.Element | null => {
  const playOnWebUrl = `${environmentUrls.playWebsite}/games/start?placeId=${placeId}`;
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isButtonRendered = Boolean(wasmJoinId);
  usePlayOnWebImpression(buttonRef, universeId, isButtonRendered);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      firePlayOnWebClickCounter();
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
      if (wasmJoinId) {
        url.searchParams.set(WASM_HASH_PARAM, wasmJoinId);
      }
      window.open(url.toString(), "_blank", "noopener");
    },
    [placeId, universeId, eventProperties, playOnWebUrl, wasmJoinId],
  );

  if (!isButtonRendered) {
    return null;
  }

  return (
    <Button
      ref={buttonRef}
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
