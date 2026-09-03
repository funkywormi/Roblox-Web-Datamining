import React, { useCallback, useMemo, useRef } from "react";
import { createSystemFeedback } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { navigateToLoginWithRedirect } from "@rbx/navigation";
import { launchLogin } from "@rbx/game-play-button";
import { VirtualEvent } from "../services/services";
import {
  tryParseDate,
  getEventLivenessState,
  generateSessionId,
  joinExperience,
} from "../utils/utils";
import AnalyticsEvents from "../utils/analytics";
import { counterConstants, EVENT_LIVENESS_STATE } from "../constants/constants";
import { TGetGameDetails } from "../../common/types/bedev1Types";
import WideTileView from "../../common/components/WideTileView";
import { TComponentType, THoverStyle } from "../../common/types/bedev2Types";
import useEventRsvpStatus from "../hooks/useEventRsvpStatus";
import { buildEventDetailsUrl } from "../../common/utils/browserUtils";
import ExperienceEventTileActionButton from "./ExperienceEventTileActionButton";
import ExperienceEventTileWideActionButton from "./ExperienceEventTileWideActionButton";
import ExperienceEventTileThumbnail from "./ExperienceEventTileThumbnail";
import ExperienceEventTileFooter from "./ExperienceEventTileFooter";
import ExperienceEventTileOverlayPill from "./ExperienceEventTileOverlayPill";
import useEventTileImpressionTracker from "../hooks/useEventTileImpressionTracker";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

type TExperienceEventsTileProps = {
  eventItem: VirtualEvent;
  universeDetails: TGetGameDetails;
  playabilityStatus: string | undefined;
  attributionId: string;
  referralSessionInfo: TDiscoverySessionInfo;
  referralPage: PageContext | undefined;
  translate: TranslateFunction;
  vngLandingRedirectEnabled: boolean | undefined;
};

const ExperienceEventTile = ({
  eventItem,
  universeDetails,
  playabilityStatus,
  attributionId,
  referralSessionInfo,
  referralPage,
  translate,
  vngLandingRedirectEnabled,
}: TExperienceEventsTileProps): JSX.Element => {
  const tileRef = useRef<HTMLDivElement>(null);

  const isEventLive = useMemo(() => {
    return (
      getEventLivenessState(
        tryParseDate(eventItem.eventTime.startUtc),
        tryParseDate(eventItem.eventTime.endUtc),
      ) === EVENT_LIVENESS_STATE.LIVE
    );
  }, [eventItem.eventTime.startUtc, eventItem.eventTime.endUtc]);

  const trackEventDetailsPageVisit = useCallback(() => {
    AnalyticsEvents.sendEventDetailsPageVisitFromExpDetailsEvent(
      eventItem.id,
      eventItem.universeId,
    );
  }, [eventItem.id, eventItem.universeId]);

  useEventTileImpressionTracker(tileRef, eventItem.id, eventItem.universeId);

  const { userHasRsvpd, totalRsvps, handleToggleRsvpClick } = useEventRsvpStatus(
    eventItem,
    referralSessionInfo,
    referralPage,
    systemFeedbackService,
    translate,
  );

  const joinEventBtnClicked = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const sessionId = generateSessionId();
      AnalyticsEvents.sendVirtualEventJoinedFromExperienceDetailsPageEvent(
        eventItem.id,
        eventItem.universeId,
        sessionId,
        totalRsvps,
      );
      const joinFailedEventName = counterConstants.prefix + counterConstants.joinFailed;
      const targetPlace: number | undefined = eventItem.placeId
        ? eventItem.placeId
        : universeDetails.rootPlaceId;
      if (!authenticatedUser()?.isAuthenticated) {
        // If it is vng, redirect user to login page directly
        // This is the same logic as the play button
        if (vngLandingRedirectEnabled) {
          // redirct to login page
          navigateToLoginWithRedirect();
        } else if (targetPlace) {
          launchLogin(targetPlace.toString(), {});
        } else {
          window.EventTracker?.fireEvent(joinFailedEventName);
        }
        return;
      }
      try {
        if (targetPlace !== undefined) {
          joinExperience(
            targetPlace,
            sessionId,
            eventItem.id,
            universeDetails.id,
            attributionId,
            referralSessionInfo,
            referralPage,
          );
        }
      } catch {
        window.EventTracker?.fireEvent(joinFailedEventName);
      }
    },
    [
      eventItem,
      totalRsvps,
      universeDetails,
      vngLandingRedirectEnabled,
      launchLogin,
      attributionId,
      referralSessionInfo,
      referralPage,
    ],
  );

  const tileThumbnail = (
    <ExperienceEventTileThumbnail
      eventThumbnailId={eventItem.thumbnails?.[0]?.mediaId}
      placeId={universeDetails.rootPlaceId}
      altText={eventItem.displayTitle || eventItem.title}
    />
  );

  const thumbnailOverlayPill = (
    <ExperienceEventTileOverlayPill
      isEventLive={isEventLive}
      eventStartTimeUtc={eventItem.eventTime.startUtc}
      eventCategory={eventItem.eventCategories?.[0]?.category}
      translate={translate}
    />
  );

  const wideTileButton = useMemo(
    () => (
      <ExperienceEventTileWideActionButton
        isEventLive={isEventLive}
        playabilityStatus={playabilityStatus}
        userHasRsvpd={userHasRsvpd}
        onRsvpButtonClick={handleToggleRsvpClick}
        onJoinEventBtnClicked={joinEventBtnClicked}
        translate={translate}
      />
    ),
    [
      isEventLive,
      playabilityStatus,
      userHasRsvpd,
      handleToggleRsvpClick,
      joinEventBtnClicked,
      translate,
    ],
  );

  const tileFooter = (
    <ExperienceEventTileFooter
      footerText={
        eventItem.displaySubtitle ||
        eventItem.subtitle ||
        eventItem.displayDescription ||
        eventItem.description
      }
      wideButton={wideTileButton}
    />
  );

  const actionButton = (
    <ExperienceEventTileActionButton
      isEventLive={isEventLive}
      playabilityStatus={playabilityStatus}
      userHasRsvpd={userHasRsvpd}
      onRsvpButtonClick={handleToggleRsvpClick}
      onJoinEventBtnClicked={joinEventBtnClicked}
      translate={translate}
    />
  );

  const eventReferralUrl = useMemo(() => {
    return buildEventDetailsUrl(eventItem.id);
  }, [eventItem.id]);

  const getShouldShowActionButton = () => {
    // Circular button variant is currently disabled
    // Action button is moved into the footer component
    // This can be cleaned up if we launch the wide button variant
    return false;
  };

  return (
    <WideTileView
      id={eventItem.id}
      title={eventItem.displayTitle || eventItem.title}
      linkUrl={eventReferralUrl}
      tileRef={tileRef}
      hoverStyle={THoverStyle.imageOverlay}
      wideTileType={TComponentType.ExperienceEventsTile}
      isHoverEnabled
      isContainedTile
      isOnScreen
      isTileClickEnabled
      onTileClick={trackEventDetailsPageVisit}
      getShouldShowActionButton={getShouldShowActionButton}
      actionButton={actionButton}
      tileThumbnail={tileThumbnail}
      thumbnailOverlayPill={thumbnailOverlayPill}
      tileFooter={tileFooter}
      systemFeedback={<SystemFeedback />}
    />
  );
};

export default ExperienceEventTile;
