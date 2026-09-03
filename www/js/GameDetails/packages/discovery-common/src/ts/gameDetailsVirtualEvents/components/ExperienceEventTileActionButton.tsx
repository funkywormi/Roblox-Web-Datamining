import classNames from "classnames";
import React from "react";
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

const ExperienceEventTileActionButton = ({
  isEventLive,
  playabilityStatus,
  userHasRsvpd,
  onRsvpButtonClick,
  onJoinEventBtnClicked,
  translate,
}: TExperienceEventActionButtonProps): JSX.Element => {
  if (isEventLive) {
    return (
      <button
        type="button"
        disabled={
          playabilityStatus !== PlayabilityStatus.Playable &&
          playabilityStatus !== PlayabilityStatus.GuestProhibited
        }
        onClick={onJoinEventBtnClicked}
        className="btn-growth-xs play-button regular-play-button"
        aria-label={getTranslationStringForKeyWithFallback(translate, "joinEvent")}
      >
        <span className="icon-common-play" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={classNames("btn-growth-xs", "play-button", "notification-button", {
        "notification-on": userHasRsvpd,
      })}
      onClick={onRsvpButtonClick}
      aria-label={
        userHasRsvpd
          ? getTranslationStringForKeyWithFallback(translate, "unfollowEvent")
          : getTranslationStringForKeyWithFallback(translate, "NotifyMe")
      }
    >
      <span
        className={
          userHasRsvpd ? "icon-selected-notification-bell-inverse" : "icon-common-notification-bell"
        }
      />
    </button>
  );
};

export default ExperienceEventTileActionButton;
