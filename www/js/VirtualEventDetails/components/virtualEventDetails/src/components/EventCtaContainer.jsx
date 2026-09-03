import React from "react";
import PropTypes from "prop-types";

import { RSVP_STATUS, EVENT_STATUS } from "../services";

import EventJoinButton from "./EventJoinButton";
import EventShareButton from "./EventShareButton";

import "../css/virtualEventDetails/virtualEventCtaContainer.scss";
import { EVENT_LIVENESS_STATE } from "../constants";

// eslint-disable-next-line no-empty-function
const emptyFunc = () => {};
function EventCtaContainer({
  eventStatus,
  userRsvpStatus,
  eventId,
  universeId, // only needed for analytics
  attendanceCount, // only needed for analytics
  eventLivenessState,
  updateUserRsvpStatusCallback,
  rootPlaceId,
  eventPlaceId,
  onShareButtonClicked,
}) {
  // app-bumper is the bottom banner asking you to download the android app and
  // covering up our stuff
  const isAppBumperVisible = () => {
    return document.getElementsByClassName("app-bumper-container").length > 0;
  };

  const isShareButtonHidden = () => {
    // sometimes we show button without share but never the other way around
    if (
      eventStatus === EVENT_STATUS.CANCELLED ||
      eventStatus === EVENT_STATUS.MODERATED ||
      eventLivenessState === EVENT_LIVENESS_STATE.PAST
    ) {
      return true;
    }

    return false;
  };

  const isEntireCtaContainerHidden = () => {
    return eventLivenessState === EVENT_LIVENESS_STATE.PAST;
  };

  return (
    <div
      className={`virtual-event-cta-container ${isEntireCtaContainerHidden() ? "hidden" : ""} ${
        isAppBumperVisible() ? "app-bumper-override" : ""
      }`}
    >
      {/* Note, the order of these is defined by the CSS, since it's reversed on mobile */}
      <EventJoinButton
        eventId={eventId}
        eventStatus={eventStatus}
        userRsvpStatus={userRsvpStatus}
        eventLivenessState={eventLivenessState}
        updateUserRsvpStatusCallback={updateUserRsvpStatusCallback}
        rootPlaceId={rootPlaceId}
        universeId={universeId}
        eventPlaceId={eventPlaceId}
        attendanceCount={attendanceCount}
      />
      {!isShareButtonHidden() && <EventShareButton onShareButtonClicked={onShareButtonClicked} />}
    </div>
  );
}
EventCtaContainer.propTypes = {
  eventStatus: PropTypes.string,
  userRsvpStatus: PropTypes.string,
  eventId: PropTypes.string,
  eventLivenessState: PropTypes.string,
  updateUserRsvpStatusCallback: PropTypes.func,
  rootPlaceId: PropTypes.number,
  eventPlaceId: PropTypes.number,
  universeId: PropTypes.number.isRequired,
  onShareButtonClicked: PropTypes.func.isRequired,
  attendanceCount: PropTypes.number.isRequired,
};

EventCtaContainer.defaultProps = {
  eventStatus: "",
  userRsvpStatus: RSVP_STATUS.NONE,
  rootPlaceId: -1,
  eventPlaceId: -1,
  eventLivenessState: "",
  eventId: "",
  updateUserRsvpStatusCallback: emptyFunc,
};

export default EventCtaContainer;
