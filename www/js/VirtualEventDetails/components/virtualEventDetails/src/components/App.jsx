import React, { useEffect, useState, useCallback } from "react";
import { withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { CurrentUser, Endpoints } from "@rbx/core-scripts/legacy/Roblox";
import { translation } from "../translation.config";
import {
  getEventDetailsRes,
  getEventRsvpRes,
  getTotalRsvpCounters,
  getDetailsForUniverseIds,
  RSVP_STATUS,
  EVENT_STATUS,
  getThumbnailForGame,
  getEventThumbnailUrl,
} from "../services";

import AnalyticsEvents from "../analytics";

import EventHero from "./EventHero";
import EventDescription from "./EventDescription";
import ExperienceLink from "./ExperienceLink";
import MediaCarousel from "./MediaCarousel";
import EventParticipants from "./EventParticipants";
import EventHostedBy from "./EventHostedBy";

import { tryParseDate } from "../utils";

import "../css/virtualEventDetails/virtualEventDetails.scss";
import "../css/virtualEventDetails/virtualEventBody.scss";

import * as fallbackUrl from "../css/images/placeholder.jpg";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [eventDetails, setEventDetails] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [totalGoingCount, setTotalGoingCount] = useState(0);
  const [gameDetails, setGameDetails] = useState(null);
  const [heroThumbnailUrl, setHeroThumbnailUrl] = useState(null);

  let pathName = window.location.pathname;
  if (Endpoints && Endpoints.supportLocalizedUrls) {
    pathName = Endpoints.removeUrlLocale(pathName);
  }
  const eventId = pathName.split("/")[2];

  const updateUserRsvpStatusCallback = useCallback(userRsvpStatus => {
    let currentUserId;
    try {
      currentUserId = parseInt(CurrentUser.userId, 10);
    } catch {
      currentUserId = -1;
    }

    setEventDetails(currentEventDetails => ({ ...currentEventDetails, userRsvpStatus }));

    if (userRsvpStatus !== RSVP_STATUS.GOING) {
      setRsvps(currentRsvps => {
        const filteredRsvps = currentRsvps.filter(rsvp => {
          return currentUserId !== rsvp.userId;
        });
        return filteredRsvps;
      });
      setTotalGoingCount(currentGoingCount => {
        return Math.max(0, currentGoingCount - 1);
      });
    } else {
      setRsvps(currentRsvps => {
        const concattedRsvps = [{ userId: currentUserId, rsvpStatus: userRsvpStatus }].concat(
          currentRsvps,
        );
        return concattedRsvps;
      });
      setTotalGoingCount(currentGoingCount => {
        return currentGoingCount + 1;
      });
    }
  }, []);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // TODO parallelize these network calls better https://jira.rbx.com/browse/EN-1732
        // and make it so if one fails they don't all fail
        // if evenDetails fails, nothing else can continue
        // but anything else can fail and it won't detroy the whole page
        const eventDetailsRes = await getEventDetailsRes(eventId);
        // Parse fetched thumbnails into ordered array
        const parsedThumbnails = [];
        if (eventDetailsRes.thumbnails?.length > 0) {
          eventDetailsRes.thumbnails.forEach(thumbnail => {
            parsedThumbnails[thumbnail.rank] = thumbnail.mediaId;
          });
        }
        const parsedEventDetails = { parsedThumbnails, ...eventDetailsRes };
        setEventDetails(parsedEventDetails);

        try {
          const eventRsvps = await getEventRsvpRes(eventId);
          setRsvps(eventRsvps);
        } catch {
          setRsvps([]);
        }

        try {
          const totalRsvpsRes = await getTotalRsvpCounters(eventId);
          setTotalGoingCount(totalRsvpsRes?.counters.going);
        } catch {
          setTotalGoingCount(0);
        }

        try {
          const gameDetailsRes = await getDetailsForUniverseIds(eventDetailsRes?.universeId);
          setGameDetails(gameDetailsRes);
        } catch {
          setGameDetails(null);
        }

        try {
          let eventThumbnailFetchSuccess = false;
          if (parsedThumbnails[0]) {
            const eventThumbnailRes = await getEventThumbnailUrl(parsedThumbnails[0]);
            if (eventThumbnailRes) {
              setHeroThumbnailUrl(eventThumbnailRes);
              eventThumbnailFetchSuccess = true;
            }
          }
          if (!eventThumbnailFetchSuccess) {
            const gameThumbnailRes = await getThumbnailForGame(eventDetailsRes?.universeId);
            setHeroThumbnailUrl(gameThumbnailRes);
          }
          // eslint-disable-next-line no-empty
        } catch {}

        AnalyticsEvents.sendEventDetailsPageVisitEvent(eventId, eventDetailsRes?.universeId);

        setIsLoading(false);
      } catch (error) {
        window.location.replace(
          new URL(`request-error?code=${error?.status || "404"}`, window.location.origin),
        );
      }
    };

    fetchEventData();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="virtual-event-detail-container">
        <span className="spinner spinner-default" />
      </div>
    );
  }

  const localizedTitle = eventDetails?.displayTitle ?? "";
  const localizedSubtitle = eventDetails?.displaySubtitle ?? "";
  const localizedDescription = eventDetails?.displayDescription ?? "";
  const finalTitle = localizedTitle.trim() === "" ? eventDetails?.title : localizedTitle;
  const finalSubtitle =
    localizedSubtitle.trim() === "" ? eventDetails?.subtitle : localizedSubtitle;
  const finalDescription =
    localizedDescription.trim() === "" ? eventDetails?.description : localizedDescription;

  return (
    <div className="virtual-event-detail-container" data-testid="virtual-events-content-root">
      <EventHero
        title={finalTitle}
        subtitle={finalSubtitle}
        category={
          eventDetails.eventCategories && eventDetails.eventCategories.length > 0
            ? eventDetails.eventCategories[0].category
            : ""
        }
        eventStatus={eventDetails?.eventStatus}
        userRsvpStatus={eventDetails?.userRsvpStatus}
        imgSrc={heroThumbnailUrl || fallbackUrl.default}
        rootPlaceId={gameDetails?.rootPlaceId}
        eventPlaceId={eventDetails?.placeId}
        startTimeUtc={tryParseDate(eventDetails?.eventTime?.startUtc)}
        endTimeUtc={tryParseDate(eventDetails?.eventTime?.endUtc)}
        eventId={eventId}
        updateUserRsvpStatusCallback={updateUserRsvpStatusCallback}
        // only needed for analytics
        universeId={eventDetails?.universeId}
        attendanceCount={totalGoingCount}
      />
      {eventDetails?.eventStatus !== EVENT_STATUS.CANCELLED &&
        eventDetails?.eventStatus !== EVENT_STATUS.MODERATED && (
          <div>
            <div className="virtual-event-body-container desktop">
              <div className="virtual-event-body-half">
                {totalGoingCount > 0 && gameDetails !== null && (
                  <EventParticipants
                    facepileUsers={rsvps}
                    numberInterested={totalGoingCount}
                    numberActive={gameDetails?.playing}
                    startTimeUtc={tryParseDate(eventDetails?.eventTime?.startUtc)}
                    endTimeUtc={tryParseDate(eventDetails?.eventTime?.endUtc)}
                    userRsvpStatus={eventDetails?.userRsvpStatus}
                    eventStatus={eventDetails?.eventStatus}
                  />
                )}
                <EventDescription description={finalDescription} />
                {gameDetails !== null && (
                  <ExperienceLink
                    universeId={eventDetails?.universeId}
                    rootPlaceId={gameDetails?.rootPlaceId}
                    name={gameDetails?.name}
                  />
                )}
              </div>
              <div className="virtual-event-body-half">
                <MediaCarousel
                  eventThumbnails={eventDetails?.parsedThumbnails}
                  universeId={eventDetails?.universeId}
                  placeId={gameDetails?.rootPlaceId}
                />
                <EventHostedBy host={eventDetails?.host} />
              </div>
            </div>
            {/* https://jira.rbx.com/browse/EN-1751 see if we can do this without duplication */}
            <div className="virtual-event-body-container mobile">
              <div className="virtual-event-body-mobile">
                <EventParticipants
                  facepileUsers={rsvps}
                  numberInterested={totalGoingCount}
                  numberActive={gameDetails?.playing}
                  startTimeUtc={tryParseDate(eventDetails?.eventTime?.startUtc)}
                  endTimeUtc={tryParseDate(eventDetails?.eventTime?.endUtc)}
                  userRsvpStatus={eventDetails?.userRsvpStatus}
                  eventStatus={eventDetails?.eventStatus}
                />
                <MediaCarousel
                  eventThumbnails={eventDetails?.parsedThumbnails}
                  universeId={eventDetails?.universeId}
                  placeId={gameDetails?.rootPlaceId}
                />
                <EventDescription description={finalDescription} />
                <ExperienceLink
                  universeId={eventDetails?.universeId}
                  rootPlaceId={gameDetails?.rootPlaceId}
                  name={gameDetails?.name}
                />
                <EventHostedBy host={eventDetails?.host} />
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default withTranslations(App, translation);
