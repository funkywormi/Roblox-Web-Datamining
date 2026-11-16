import React, { useCallback, useRef } from "react";
import classNames from "classnames";
import { Button } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import playButtonConstants from "../constants/playButtonConstants";
import { fuiButtonStyle } from "../constants/buttonWidths";
import { openPlayOnWeb } from "../utils/openPlayOnWeb";
import usePlayOnWebImpression from "../hooks/usePlayOnWebImpression";
import { PlayOnWebVariant, type TPlayOnWebVariant } from "../types/playButtonTypes";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TPlayOnWebButtonProps = {
  placeId: string;
  rootPlaceId?: string;
  universeId: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  eventProperties?: Record<string, string | number | undefined>;
  wasmJoinId?: string;
  playOnWebVariant: Exclude<TPlayOnWebVariant, typeof PlayOnWebVariant.None>;
};

const PlayOnWebButton = ({
  placeId,
  rootPlaceId,
  universeId,
  privateServerLinkCode,
  gameInstanceId,
  eventProperties,
  wasmJoinId,
  playOnWebVariant,
}: TPlayOnWebButtonProps): React.JSX.Element | null => {
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isButtonRendered = Boolean(wasmJoinId);
  usePlayOnWebImpression(buttonRef, universeId, isButtonRendered);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openPlayOnWeb({
        placeId,
        rootPlaceId,
        universeId,
        privateServerLinkCode,
        gameInstanceId,
        eventProperties,
        wasmJoinId,
      });
    },
    [
      placeId,
      rootPlaceId,
      universeId,
      privateServerLinkCode,
      gameInstanceId,
      eventProperties,
      wasmJoinId,
    ],
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
