import React, { useCallback, useRef } from "react";
import classNames from "classnames";
import { Button } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import playButtonConstants from "../constants/playButtonConstants";
import { fuiButtonStyle } from "../constants/buttonWidths";
import usePlayOnWebImpression from "../hooks/usePlayOnWebImpression";
import usePlayOnWeb from "../hooks/usePlayOnWeb";
import {
  PlayOnWebVariant,
  type TPlayButtonPageContext,
  type TPlayOnWebVariant,
} from "../types/playButtonTypes";

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
  pageContext: TPlayButtonPageContext;
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
  pageContext,
}: TPlayOnWebButtonProps): React.JSX.Element | null => {
  const tExperienceDetails = useTranslations("Feature.ExperienceDetails");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isButtonRendered = Boolean(wasmJoinId);
  usePlayOnWebImpression(buttonRef, universeId, isButtonRendered);

  const { playOnWeb, playableUxTreatmentModal } = usePlayOnWeb(
    {
      placeId,
      rootPlaceId,
      universeId,
      privateServerLinkCode,
      gameInstanceId,
      eventProperties,
      wasmJoinId,
    },
    pageContext,
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      playOnWeb();
    },
    [playOnWeb],
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
          isOneButton ? "game-play-button-lg" : "btn-control-lg",
        )}
        aria-label={isOneButton ? playOnWebText : undefined}
        onClick={handleClick}
      >
        {isOneButton ? <span className="icon icon-filled-play-large size-700" /> : playOnWebText}
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
      {playableUxTreatmentModal}
    </div>
  );
};

export default PlayOnWebButton;
