import classNames from "classnames";
import React, { useMemo } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { PlayabilityStatus } from "@rbx/game-play-button";
import { getTranslationStringForKeyWithFallback } from "../constants/constants";

type TExperienceEventActionButtonProps = {
  isEventLive: boolean;
  playabilityStatus: string | undefined;
  userHasRsvpd: boolean;
  onRsvpButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onJoinEventBtnClicked: (e: React.MouseEvent<HTMLButtonElement>) => void;
  translate: TranslateFunction;
};

const ExperienceEventTileWideActionButton = ({
  isEventLive,
  playabilityStatus,
  userHasRsvpd,
  onRsvpButtonClick,
  onJoinEventBtnClicked,
  translate,
}: TExperienceEventActionButtonProps): JSX.Element => {
  const buttonText = useMemo(() => {
    if (isEventLive) {
      return getTranslationStringForKeyWithFallback(translate, "joinEvent");
    }
    return userHasRsvpd
      ? getTranslationStringForKeyWithFallback(translate, "unfollowEvent")
      : getTranslationStringForKeyWithFallback(translate, "NotifyMe");
  }, [isEventLive, translate, userHasRsvpd]);

  return (
    <button
      type="button"
      disabled={
        isEventLive &&
        playabilityStatus !== PlayabilityStatus.Playable &&
        playabilityStatus !== PlayabilityStatus.GuestProhibited
      }
      className={classNames("btn-growth-xs", "play-button", "wide-event-play-button", {
        "event-follow-button": !isEventLive && !userHasRsvpd,
        "event-unfollow-button": !isEventLive && userHasRsvpd,
      })}
      onClick={isEventLive ? onJoinEventBtnClicked : onRsvpButtonClick}
      aria-label={buttonText}
    >
      <span>{buttonText}</span>
    </button>
  );
};

export default ExperienceEventTileWideActionButton;
