import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  CurrentUser,
  Dialog,
  Endpoints,
  FormEvents,
  TranslationResourceProvider,
} from "@rbx/core-scripts/legacy/Roblox";
import { withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { usePlayabilityStatus } from "@rbx/game-play-button";
import { translation } from "../translation.config";
import { getTranslationStringForKeyWithFallback, EVENT_LIVENESS_STATE } from "../constants";
import { postRsvpStatus, RSVP_STATUS, EVENT_STATUS } from "../services";
import AnalyticsEvents from "../analytics";
import { generateSessionId, joinExperience } from "../utils";
import "../css/virtualEventDetails/virtualEventJoinButton.scss";
import Experiments from "../experiments";

// eslint-disable-next-line no-empty-function
const emptyFunc = () => {};

function EventJoinButton({
  eventStatus,
  userRsvpStatus,
  eventId,
  universeId, // only needed for analytics
  attendanceCount, // only needed for analytics
  eventLivenessState,
  updateUserRsvpStatusCallback,
  eventPlaceId,
  rootPlaceId,
  translate,
}) {
  const BUTTON_STATE = {
    // Interested? - not yet rsvp'd (upcoming event)
    INTERESTED_UNCLICKED: "INTERESTED_UNCLICKED",
    // Interested? - rsvp'd (upcoming event)
    INTERESTED_CLICKED: "INTERESTED_CLICKED",
    // Join Event (live event)
    JOIN_EVENT: "JOIN_EVENT",
    // Join Event - disabled  (private event)
    JOIN_EVENT_DISABLED: "JOIN_EVENT_DISABLED",
    // button hidden (past event)
    HIDDEN: "HIDDEN",
    // Go Home (cancelled event)
    GO_HOME: "GO_HOME",
  };

  const { playabilityStatus } = usePlayabilityStatus(universeId.toString());
  const eventPlaceJoinEnabled = Experiments.getUserCanJoinNonRootPlace();

  const isPlayButtonEnabled = useMemo(() => {
    return playabilityStatus === "Playable";
  }, [playabilityStatus]);

  const getButtonState = () => {
    if (eventStatus === EVENT_STATUS.ACTIVE) {
      if (eventLivenessState === EVENT_LIVENESS_STATE.UPCOMING) {
        if (userRsvpStatus === RSVP_STATUS.GOING) {
          return BUTTON_STATE.INTERESTED_CLICKED;
        }
        if (userRsvpStatus === RSVP_STATUS.NONE || userRsvpStatus === RSVP_STATUS.NOT_GOING) {
          return BUTTON_STATE.INTERESTED_UNCLICKED;
        }
      } else if (eventLivenessState === EVENT_LIVENESS_STATE.LIVE) {
        return BUTTON_STATE.JOIN_EVENT;
      } else {
        // event is passed
        return BUTTON_STATE.HIDDEN;
      }
    } else if (eventStatus === EVENT_STATUS.CANCELLED) {
      return BUTTON_STATE.GO_HOME;
    }

    // default case
    return BUTTON_STATE.HIDDEN;
  };

  const getButtonClassForState = btnState => {
    switch (btnState) {
      case BUTTON_STATE.INTERESTED_CLICKED:
        return "interested-clicked-state btn-secondary-md"; // icon-favorite favorited
      case BUTTON_STATE.INTERESTED_UNCLICKED:
        return "interested-unclicked-state btn-cta-md"; //  icon-favorite
      case BUTTON_STATE.JOIN_EVENT:
        return "join-event-state btn-growth-md";
      case BUTTON_STATE.HIDDEN:
        return "hidden-state";
      case BUTTON_STATE.GO_HOME:
        return "go-home-state btn-cta-md";
      default:
        return "";
    }
  };

  const getButtonTextForStatus = btnState => {
    switch (btnState) {
      case BUTTON_STATE.INTERESTED_CLICKED:
        return getTranslationStringForKeyWithFallback(translate, "unfollowEvent");
      case BUTTON_STATE.INTERESTED_UNCLICKED:
        return getTranslationStringForKeyWithFallback(translate, "NotifyMe");
      case BUTTON_STATE.JOIN_EVENT:
        return getTranslationStringForKeyWithFallback(translate, "joinEvent");
      case BUTTON_STATE.JOIN_EVENT_DISABLED:
        return getTranslationStringForKeyWithFallback(translate, "joinEvent");
      case BUTTON_STATE.HIDDEN:
        return "";
      case BUTTON_STATE.GO_HOME:
        return getTranslationStringForKeyWithFallback(translate, "goHome");
      default:
        return "";
    }
  };

  const launchSignupLoginDialog = () => {
    // Stolen from // https://github.rbx.com/Roblox/web-frontend/blob/master/WebApps/Roblox.GameLaunch.WebApp/Roblox.GameLaunch.WebApp/js/authenticationChecker.js#L41
    const soliConstants = {
      modalClassName: "soli-modal",
      loginUrl: "/login?returnurl=",
      signupUrl: "/?returnurl=",
      eventContext: "gameDetails",
      loginField: "gameLaunch_login",
      signupField: "gameLaunch_signup",
    };

    // this doesn't seem to work with the translate thats injected by react,
    // but it works with this old one that they were using.
    const translationProvider = new TranslationResourceProvider();
    const langMap = translationProvider.getTranslationResource("Feature.GameLaunchGuestMode");

    function redirectToSignupWithEvent(eventField) {
      const eventContext = "gameDetails";
      if (FormEvents) {
        FormEvents.SendInteractionClick(eventContext, eventField);
      }
      const signupUrl =
        soliConstants.signupUrl +
        encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = Endpoints ? Endpoints.getAbsoluteUrl(signupUrl) : signupUrl;
    }

    Dialog.open({
      titleText: langMap.get("Heading.Dialog.SignUpOrLogin"),
      bodyContent: langMap.get("Description.Dialog.SignUpOrLogin"),
      cssClass: soliConstants.modalClassName,
      acceptColor: Dialog.green,
      acceptText: langMap.get("Action.Dialog.SignUp"),
      declineText: langMap.get("Action.Dialog.Login"),
      onDecline: () => {
        if (FormEvents) {
          FormEvents.SendInteractionClick(soliConstants.eventContext, soliConstants.loginField);
        }
        const loginUrl =
          soliConstants.loginUrl +
          encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = Endpoints ? Endpoints.getAbsoluteUrl(loginUrl) : loginUrl;
      },
      onAccept: () => {
        redirectToSignupWithEvent(soliConstants.signupField);
      },
    });
  };

  const interestedButtonClick = useCallback(async () => {
    const isUserAuthenticated = CurrentUser?.isAuthenticated;
    if (!isUserAuthenticated) {
      launchSignupLoginDialog();
    }

    try {
      const newStatus =
        userRsvpStatus === RSVP_STATUS.GOING ? RSVP_STATUS.NOT_GOING : RSVP_STATUS.GOING;
      await postRsvpStatus(eventId, newStatus);

      AnalyticsEvents.sendVirtualEventRSVPEvent(eventId, universeId, newStatus, attendanceCount);

      updateUserRsvpStatusCallback(newStatus);
    } catch {
      // TODO proper error handling here
    }
  }, [userRsvpStatus, eventId, updateUserRsvpStatusCallback, universeId, attendanceCount]);

  const goHomeButtonClicked = useCallback(async () => {
    window.location.href = window.location.origin;
  }, []);

  const joinExperienceButtonClick = useCallback(
    async e => {
      e.preventDefault();
      e.stopPropagation();
      const sessionId = generateSessionId();
      AnalyticsEvents.sendVirtualEventJoinedEvent(eventId, universeId, sessionId, attendanceCount);
      const placeToJoin =
        (await eventPlaceJoinEnabled) && eventPlaceId && eventPlaceId !== -1
          ? eventPlaceId
          : rootPlaceId;
      try {
        joinExperience(placeToJoin, sessionId, eventId);
        // eslint-disable-next-line no-empty
      } catch {}
    },
    [rootPlaceId, eventId, universeId, attendanceCount, eventPlaceJoinEnabled, eventPlaceId],
  );

  const getButtonActionForState = btnState => {
    switch (btnState) {
      case BUTTON_STATE.INTERESTED_CLICKED:
      case BUTTON_STATE.INTERESTED_UNCLICKED:
        return interestedButtonClick;
      case BUTTON_STATE.JOIN_EVENT:
        return joinExperienceButtonClick;
      case BUTTON_STATE.GO_HOME:
        return goHomeButtonClicked;
      case BUTTON_STATE.JOIN_EVENT_DISABLED:
      case BUTTON_STATE.HIDDEN:
      default:
        return emptyFunc;
    }
  };

  const buttonState = getButtonState();
  const buttonText = getButtonTextForStatus(buttonState);
  const buttonClass = getButtonClassForState(buttonState);
  const onButtonClick = getButtonActionForState(buttonState);
  return buttonState === BUTTON_STATE.HIDDEN ? (
    <div className={`virtual-event-join-button ${buttonClass}`} />
  ) : (
    <button
      type="button"
      data-testid="join-button"
      disabled={!isPlayButtonEnabled && eventLivenessState === EVENT_LIVENESS_STATE.LIVE}
      className={`virtual-event-join-button ${buttonClass}`}
      aria-label={
        !isPlayButtonEnabled && eventLivenessState === EVENT_LIVENESS_STATE.LIVE
          ? playabilityStatus
          : buttonText
      } // todo get translations for aria labels to be more descriptive
      onClick={onButtonClick}
    >
      <span>{buttonText}</span>
    </button>
  );
}

EventJoinButton.propTypes = {
  eventStatus: PropTypes.string,
  userRsvpStatus: PropTypes.string,
  eventId: PropTypes.string,
  eventLivenessState: PropTypes.string,
  updateUserRsvpStatusCallback: PropTypes.func,
  rootPlaceId: PropTypes.number,
  eventPlaceId: PropTypes.number,
  translate: PropTypes.func.isRequired,
  universeId: PropTypes.number.isRequired,
  attendanceCount: PropTypes.number.isRequired,
};

EventJoinButton.defaultProps = {
  eventStatus: "",
  userRsvpStatus: RSVP_STATUS.NONE,
  rootPlaceId: -1,
  eventPlaceId: -1,
  eventLivenessState: "",
  eventId: "",
  updateUserRsvpStatusCallback: emptyFunc,
};

export default withTranslations(EventJoinButton, translation);
