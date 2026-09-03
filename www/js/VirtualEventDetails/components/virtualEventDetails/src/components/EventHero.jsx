import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translation } from "../translation.config";
import translationConstants, {
  eventCategoryTranslationKeys,
  getTranslationStringForKeyWithFallback,
} from "../constants";
import { getEventLivenessState, getLocalizedDateString } from "../utils";
import { EVENT_STATUS, RSVP_STATUS } from "../services";
import AnalyticsEvents from "../analytics";

import EventCtaContainer from "./EventCtaContainer";
import EventShareModal from "./EventShareModal";
import "../css/virtualEventDetails/virtualEventHeroHeader.scss";

function EventHero({
  title,
  subtitle,
  category,
  eventId,
  startTimeUtc,
  endTimeUtc,
  eventStatus,
  userRsvpStatus,
  rootPlaceId,
  eventPlaceId,
  imgSrc,
  updateUserRsvpStatusCallback,
  translate,
  universeId,
  attendanceCount,
}) {
  const [showModal, setShowModal] = useState(false);

  const renderDates = () => {
    if (eventStatus === EVENT_STATUS.CANCELLED) {
      return (
        <div className="text-description virtual-event-cancelled-error">
          {translate(translationConstants.eventCancelled.translationKey) ||
            translationConstants.eventCancelled.fallback}
        </div>
      );
    }

    const startDate = getLocalizedDateString(startTimeUtc);
    const endDate = getLocalizedDateString(endTimeUtc);
    const dateRange = `${startDate} - ${endDate}`;

    return <div className="text-description">{dateRange}</div>;
  };

  const eventTitleWithModeration = useMemo(() => {
    if (eventStatus === EVENT_STATUS.MODERATED) {
      return getTranslationStringForKeyWithFallback(translate, "eventModeratedTitle");
    }
    return title;
  }, [title, eventStatus, translate]);

  const eventSubtitleWithModeration = useMemo(() => {
    if (eventStatus === EVENT_STATUS.MODERATED) {
      return getTranslationStringForKeyWithFallback(translate, "eventModeratedTitle"); // subtitle and title can share a fallback string
    }
    return subtitle;
  }, [subtitle, eventStatus, translate]);

  const onShareButtonClicked = useCallback(() => {
    setShowModal(true);
    AnalyticsEvents.sendShareVirtualEventIconClickedEvent(eventId, universeId, attendanceCount);
  }, [eventId, universeId, attendanceCount]);

  const onModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const localizedCategory =
    category in eventCategoryTranslationKeys
      ? translate(eventCategoryTranslationKeys[category])
      : null;

  return (
    <div className="virtual-event-hero-container" data-testid="event-hero">
      <div className="left-side-event-hero">
        {localizedCategory && (
          <div className="event-thumbnail-card-image-feature-pill">{localizedCategory}</div>
        )}
        <img className="virtual-event-hero-thumbnail" src={imgSrc} alt="" />
      </div>
      <div className="right-side-event-hero">
        <div className="right-side-event-hero-positioning-container">
          <h1 className="font-title">{eventTitleWithModeration}</h1>
          {eventSubtitleWithModeration !== "" && <h5>{eventSubtitleWithModeration}</h5>}
          {renderDates()}
          <EventCtaContainer
            eventId={eventId}
            eventStatus={eventStatus}
            userRsvpStatus={userRsvpStatus}
            eventLivenessState={getEventLivenessState(startTimeUtc, endTimeUtc)}
            updateUserRsvpStatusCallback={updateUserRsvpStatusCallback}
            rootPlaceId={rootPlaceId}
            eventPlaceId={eventPlaceId}
            universeId={universeId}
            attendanceCount={attendanceCount}
            onShareButtonClicked={onShareButtonClicked}
          />
        </div>
      </div>
      <EventShareModal
        show={showModal}
        close={onModalClose}
        eventId={eventId}
        universeId={universeId}
        attendanceCount={attendanceCount}
      />
    </div>
  );
}
// TODO Review these props and see which can be removed,
// And which are actually required : https://jira.rbx.com/browse/EN-1638
EventHero.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  category: PropTypes.string,
  eventId: PropTypes.string,
  universeId: PropTypes.number.isRequired,
  attendanceCount: PropTypes.number.isRequired,
  startTimeUtc: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
  endTimeUtc: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
  eventStatus: PropTypes.string,
  userRsvpStatus: PropTypes.string,
  rootPlaceId: PropTypes.number,
  eventPlaceId: PropTypes.number,
  imgSrc: PropTypes.string,
  updateUserRsvpStatusCallback: PropTypes.func,
  translate: PropTypes.func.isRequired,
};

EventHero.defaultProps = {
  title: "",
  subtitle: "",
  category: "",
  eventId: "",
  startTimeUtc: Date.now(),
  endTimeUtc: Date.now(),
  eventStatus: "",
  userRsvpStatus: RSVP_STATUS.NONE,
  rootPlaceId: -1,
  eventPlaceId: -1,
  imgSrc: "",
  // eslint-disable-next-line no-empty-function
  updateUserRsvpStatusCallback: () => {},
};
export default withTranslations(EventHero, translation);
