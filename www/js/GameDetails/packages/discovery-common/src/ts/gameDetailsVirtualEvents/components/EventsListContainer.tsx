import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getIsVNGLandingRedirectEnabled } from "@rbx/navigation";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { throttle } from "lodash";
import { useQuery } from "@tanstack/react-query";
import { usePlayabilityStatus } from "@rbx/game-play-button";
import { tryParseDate } from "../utils/utils";
import { VirtualEvent } from "../services/services";
import { getTranslationStringForKeyWithFallback } from "../constants/constants";
import { TGetGameDetails } from "../../common/types/bedev1Types";
import { getNumTilesPerRow } from "../../common/components/GameTileUtils";
import { TComponentType } from "../../common/types/bedev2Types";
import ExperienceEventTile from "./ExperienceEventTile";
import "../../../css/gameDetailsVirtualEvents/eventListContainer.scss";
import useElementWidthResizeObserver from "../../common/hooks/useElementWidthResizeObserver";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";

type EventList = VirtualEvent[];

type EventsListContainerProps = {
  eventList: EventList;
  universeDetails: TGetGameDetails;
  attributionId: string;
  referralSessionInfo: TDiscoverySessionInfo;
  referralPage: PageContext | undefined;
  translate: TranslateFunction;
};

const EventsListContainer = ({
  eventList,
  universeDetails,
  attributionId,
  referralSessionInfo,
  referralPage,
  translate,
}: EventsListContainerProps): JSX.Element => {
  const [expansions, setExpansions] = useState(0);
  const { playabilityStatus } = usePlayabilityStatus(universeDetails.id.toString());

  const seeMoreBtnClicked = useCallback(() => {
    setExpansions((currentExpansions: number) => {
      return currentExpansions + 1;
    });
  }, []);

  const filteredEventList = useMemo(() => {
    return eventList.filter(e => tryParseDate(e.eventTime.endUtc) > new Date().getTime());
  }, [eventList]);

  const [itemsPerRow, setItemsPerRow] = useState<number>(3);

  const defaultItems = itemsPerRow || 2;
  const itemsPerExpansion = itemsPerRow || 2;

  const isSeeMoreBtnVisible = useMemo(() => {
    return filteredEventList.length > defaultItems + itemsPerExpansion * expansions;
  }, [expansions, filteredEventList, defaultItems, itemsPerExpansion]);

  const gridRef = useRef<HTMLDivElement>(null);

  const [eventsFeedRef, eventsFeedWidth] = useElementWidthResizeObserver();

  useLayoutEffect(() => {
    const updateItemsPerRowThrottled = throttle((feedWidth: number) => {
      setItemsPerRow(getNumTilesPerRow(feedWidth, 0, TComponentType.ExperienceEventsTile));
    }, 100);

    if (eventsFeedWidth) {
      document.documentElement.style.setProperty("--home-feed-width", `${eventsFeedWidth}px`);

      // Throttle computation of items per row, since 'resize' fires frequently
      updateItemsPerRowThrottled(eventsFeedWidth);
    }
  }, [eventsFeedWidth]);

  useLayoutEffect(() => {
    if (itemsPerRow && gridRef?.current) {
      gridRef.current.style.setProperty("--items-per-row", itemsPerRow.toString());
    }
  }, [itemsPerRow]);

  const displayedEventList = useMemo(() => {
    return filteredEventList
      .sort((a, b) =>
        tryParseDate(a.eventTime.startUtc) < tryParseDate(b.eventTime.startUtc) ? -1 : 1,
      )
      .slice(0, defaultItems + itemsPerExpansion * expansions);
  }, [defaultItems, expansions, filteredEventList, itemsPerExpansion]);

  const { data: isVNGLandingRedirectEnabled } = useQuery({
    queryKey: ["getIsVNGLandingRedirectEnabled"],
    queryFn: getIsVNGLandingRedirectEnabled,
    retry: false,
  });

  if (displayedEventList.length <= 0) {
    return <div />;
  }

  return (
    <React.Fragment>
      <div className="container-header">
        <h3>{getTranslationStringForKeyWithFallback(translate, "eventsTitle")}</h3>
      </div>
      <div className="stack" ref={eventsFeedRef}>
        <div
          className="game-grid wide-game-tile-game-grid game-details-page-events-grid"
          ref={gridRef}
        >
          {displayedEventList.map((e: VirtualEvent) => {
            return (
              <ExperienceEventTile
                key={e.id}
                eventItem={e}
                universeDetails={universeDetails}
                playabilityStatus={playabilityStatus}
                attributionId={attributionId}
                referralSessionInfo={referralSessionInfo}
                referralPage={referralPage}
                translate={translate}
                vngLandingRedirectEnabled={isVNGLandingRedirectEnabled}
              />
            );
          })}
        </div>
      </div>
      {isSeeMoreBtnVisible && (
        <button
          type="button"
          aria-label={getTranslationStringForKeyWithFallback(translate, "seeMore")}
          onClick={seeMoreBtnClicked}
          className="notify-button btn-full-width btn-control-md"
        >
          {getTranslationStringForKeyWithFallback(translate, "seeMore")}
        </button>
      )}
    </React.Fragment>
  );
};

export default EventsListContainer;
