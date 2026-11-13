import React, { useCallback, useRef } from "react";
import classNames from "classnames";
import { Button } from "@rbx/foundation-ui";
import environmentUrls from "@rbx/environment-urls";
import { WASM_HASH_PARAM } from "@rbx/wasm-hash";
import { useTranslations } from "@rbx/www-common/i18n";
import playButtonConstants from "../constants/playButtonConstants";
import { fuiButtonStyle } from "../constants/buttonWidths";
import { getJoindata, sendPlayOnWebClickEvents } from "../utils/playButtonUtils";
import { firePlayOnWebClickCounter } from "../utils/playOnWebTelemetryCounters";
import usePlayOnWebImpression from "../hooks/usePlayOnWebImpression";
import { PlayOnWebVariant, type TPlayOnWebVariant } from "../types/playButtonTypes";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TPlayOnWebButtonProps = {
  placeId: string;
  universeId: string;
  eventProperties?: Record<string, string | number | undefined>;
  wasmJoinId?: string;
  playOnWebVariant: Exclude<TPlayOnWebVariant, typeof PlayOnWebVariant.None>;
};

const PlayOnWebButton = ({
  placeId,
  universeId,
  eventProperties,
  wasmJoinId,
  playOnWebVariant,
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

  const playOnWebText = tExperienceDetails.dynamic(
    playButtonTextTranslationMap.PlayOnWeb,
    undefined,
    "Play in browser",
  );

  const isOneButton = playOnWebVariant === PlayOnWebVariant.OneButton;

  return (
    <div className="play-on-web-button-container">
      <Button
        ref={buttonRef}
        data-testid="play-on-web-button"
        variant={isOneButton ? "Emphasis" : "Standard"}
        size="Large"
        style={fuiButtonStyle}
        className={classNames(
          "btn-full-width play-on-web-button",
          isOneButton ? "btn-common-play-game-lg" : "btn-control-lg",
        )}
        aria-label={isOneButton ? playOnWebText : undefined}
        onClick={handleClick}
      >
        {isOneButton ? <span className="icon-common-play" /> : playOnWebText}
      </Button>
      <span
        data-testid="play-on-web-beta-notice"
        className="text-caption-medium content-muted play-on-web-beta-notice"
      >
        {tExperienceDetails.dynamic(
          playButtonTextTranslationMap.PlayOnWebBetaNotice,
          undefined,
          "Play in browser is in beta",
        )}
      </span>
    </div>
  );
};

export default PlayOnWebButton;
