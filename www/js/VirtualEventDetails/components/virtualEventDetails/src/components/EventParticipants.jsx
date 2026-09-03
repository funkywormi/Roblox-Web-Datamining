import React from "react";
import PropTypes from "prop-types";

import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "@rbx/thumbnails";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";

import { withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translation } from "../translation.config";
import { EVENT_LIVENESS_STATE, getTranslationStringForKeyWithFallback } from "../constants";
import { getEventLivenessState, getShortenedNumber } from "../utils";
import { EVENT_STATUS, RSVP_STATUS } from "../services";

import "../css/virtualEventDetails/virtualEventParticipants.scss";

function EventParticipants({
  facepileUsers,
  numberInterested,
  startTimeUtc,
  endTimeUtc,
  eventStatus,
  numberActive,
  userRsvpStatus,
  translate,
}) {
  // if userId is in array, it will put it at the front
  // otherwise it will do nothing
  const sortUserToTopOfFacepile = (userId, usersList) => {
    let stringUserId;
    try {
      stringUserId = parseInt(userId, 10);
    } catch {
      return usersList;
    }

    // move userId to front of the list if its in there
    const position = usersList.indexOf(stringUserId);
    const usersListCopy = [...usersList];
    if (stringUserId && position >= 0) {
      usersListCopy.splice(position, 1);
      return [stringUserId, ...usersListCopy];
    }

    // if user is RSVP'd but not in our list, we should still add them
    if (stringUserId && userRsvpStatus === RSVP_STATUS.GOING) {
      return [stringUserId, ...usersListCopy];
    }

    return usersList;
  };
  const currentUserId = CurrentUser.userId;
  const maxUsersToShow = 8;
  const facepileUserIds = sortUserToTopOfFacepile(
    currentUserId,
    facepileUsers.map(user => user.userId),
  ).slice(0, maxUsersToShow);

  const getTitleTextForEventStatus = () => {
    if (getEventLivenessState(startTimeUtc, endTimeUtc) === EVENT_LIVENESS_STATE.LIVE) {
      return getTranslationStringForKeyWithFallback(translate, "attendingTitle");
    }
    return getTranslationStringForKeyWithFallback(translate, "interestedTitle");
  };

  const getNumberOfUsersForTitle = () => {
    if (getEventLivenessState(startTimeUtc, endTimeUtc) === EVENT_LIVENESS_STATE.LIVE) {
      return numberActive;
    }
    return numberInterested;
  };

  if (
    getNumberOfUsersForTitle() === 0 ||
    getEventLivenessState(startTimeUtc, endTimeUtc) === EVENT_LIVENESS_STATE.PAST ||
    eventStatus === EVENT_STATUS.CANCELLED ||
    eventStatus === EVENT_STATUS.MODERATED
  ) {
    return <div />;
  }

  return (
    <div className="event-participants-container" data-testid="event-participants-container">
      <span className="icon-currently-playing-sm" />
      <h2>{getShortenedNumber(getNumberOfUsersForTitle(), translate)}</h2>
      &nbsp;
      <h2 className="interested-title">{getTitleTextForEventStatus()}</h2>
      <ul className="facepile">
        {facepileUserIds.map(userId => {
          return (
            <li key={userId} className="avatar avatar-headshot avatar-headshot-xs">
              <div className="avatar-card-link">
                <Thumbnail2d
                  type={ThumbnailTypes.avatarHeadshot}
                  size={ThumbnailAvatarHeadshotSize.size48}
                  targetId={userId}
                  imgClassName="avatar-card-image"
                  format={ThumbnailFormat.webp}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

EventParticipants.propTypes = {
  facepileUsers: PropTypes.arrayOf(PropTypes.object),
  numberInterested: PropTypes.number,
  numberActive: PropTypes.number,
  eventStatus: PropTypes.string,
  startTimeUtc: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
  endTimeUtc: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
  userRsvpStatus: PropTypes.string,
  translate: PropTypes.func.isRequired,
};

EventParticipants.defaultProps = {
  facepileUsers: [],
  startTimeUtc: Date.now(),
  endTimeUtc: Date.now(),
  numberInterested: 0,
  eventStatus: "",
  userRsvpStatus: RSVP_STATUS.NONE,
  numberActive: 0,
};

export default withTranslations(EventParticipants, translation);
