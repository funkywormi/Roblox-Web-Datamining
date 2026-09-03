import React, { forwardRef, MutableRefObject, useCallback } from "react";
import classNames from "classnames";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { TGameData, TGetFriendsResponse } from "../types/bedev1Types";
import { SentinelTile } from "./SentinelTile";
import { TBuildEventProperties } from "./GameTileUtils";
import { isWideTileComponentType } from "../utils/parsingUtils";
import {
  TComponentType,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle,
} from "../types/bedev2Types";
import { PageContext } from "../types/pageContext";
import "../../../css/common/_gameGrid.scss";
import GameGridTile from "./GameGridTile";

export type TGameGridProps = {
  gameData: TGameData[];
  emphasis: boolean;
  translate: WithTranslationsProps["translate"];
  buildEventProperties: TBuildEventProperties;
  tileRef?: MutableRefObject<HTMLDivElement | null>;
  loadData?: () => void;
  shouldUseSentinelTile?: boolean;
  friendsPresence?: TGetFriendsResponse[];
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  topicId?: string;
  isHomeGameGrid?: boolean;
  isSearchGameGrid?: boolean;
  isSponsoredFooterAllowed?: boolean;
  isSponsoredRatingFooterAllowed?: boolean;
  hideTileMetadata?: boolean;
  hoverStyle?: THoverStyle;
  isDynamicLayoutSizingEnabled?: boolean;
  enableExplicitFeedback?: boolean;
  hiddenUniverses?: Set<number>;
  setHiddenUniverses?: React.Dispatch<React.SetStateAction<Set<number>>>;
  interestedUniverses?: Set<number>;
  toggleInterest?: (universeId: number) => void;
  page?: PageContext;
  enableSponsoredFeedback?: boolean;
  sponsoredUserCohort?: string;
  enableReportAd?: boolean;
  sponsoredFooterAdLabelText?: string;
  sponsoredFooterAdLabelFirst?: boolean;
  sponsoredFooterIncludeRatingContent?: boolean;
};

export const GameGrid = forwardRef<HTMLDivElement, TGameGridProps>(
  (
    {
      gameData,
      translate,
      emphasis,
      buildEventProperties,
      tileRef,
      loadData,
      shouldUseSentinelTile,
      friendsPresence,
      componentType,
      playerCountStyle,
      playButtonStyle,
      isHomeGameGrid,
      isSearchGameGrid,
      isSponsoredFooterAllowed,
      isSponsoredRatingFooterAllowed,
      hideTileMetadata,
      hoverStyle,
      topicId,
      isDynamicLayoutSizingEnabled,
      interestedUniverses,
      enableExplicitFeedback,
      hiddenUniverses,
      setHiddenUniverses,
      toggleInterest,
      page,
      enableSponsoredFeedback,
      sponsoredUserCohort,
      enableReportAd,
      sponsoredFooterAdLabelText,
      sponsoredFooterAdLabelFirst,
      sponsoredFooterIncludeRatingContent,
    }: TGameGridProps,
    forwardedRef,
  ) => {
    const gridClassName = classNames(
      "game-grid",
      {
        "home-game-grid": isHomeGameGrid,
      },
      {
        "search-game-grid": isSearchGameGrid,
      },
      {
        "wide-game-tile-game-grid": isWideTileComponentType(componentType),
      },
      {
        "interest-tile-game-grid": componentType === TComponentType.InterestTile,
      },
      {
        "dynamic-layout-sizing": isDynamicLayoutSizingEnabled,
      },
      {
        "dynamic-layout-sizing-disabled": !isDynamicLayoutSizingEnabled,
      },
    );

    const setIsHidden = useCallback(
      universeId => {
        return (isHidden: boolean) => {
          setHiddenUniverses?.(prev => {
            const updatedHiddenUniverseIds = new Set(prev);
            if (isHidden) {
              updatedHiddenUniverseIds.add(universeId);
            } else {
              updatedHiddenUniverseIds.delete(universeId);
            }
            return updatedHiddenUniverseIds;
          });
        };
      },
      [setHiddenUniverses],
    );
    const toggleIsHidden = useCallback(
      universeId => {
        return () => {
          setHiddenUniverses?.(prev => {
            const updatedHiddenUniverseIds = new Set(prev);
            if (updatedHiddenUniverseIds.has(universeId)) {
              updatedHiddenUniverseIds.delete(universeId);
            } else {
              updatedHiddenUniverseIds.add(universeId);
            }
            return updatedHiddenUniverseIds;
          });
        };
      },
      [setHiddenUniverses],
    );

    return (
      <div data-testid="game-grid" ref={forwardedRef} className={gridClassName}>
        {gameData.map((data, positionId) => (
          <GameGridTile
            ref={ref => {
              if (
                ((emphasis === true && positionId === 1) ||
                  (emphasis === false && positionId === 0)) &&
                tileRef
              ) {
                // eslint-disable-next-line no-param-reassign
                tileRef.current = ref;
              }
            }}
            // key should differentiate sponsored and organic tiles to prevent key collisions when the same universe appears as both sponsored and organic in an interleaved sort
            key={`${data.universeId}-isSponsored=${(data.isSponsored ?? false).toString()}`}
            id={positionId}
            gameData={data}
            translate={translate}
            buildEventProperties={buildEventProperties}
            emphasis={emphasis === true && positionId === 0 && !isHomeGameGrid}
            friendData={friendsPresence}
            componentType={componentType}
            playerCountStyle={playerCountStyle}
            playButtonStyle={playButtonStyle}
            isSponsoredFooterAllowed={isSponsoredFooterAllowed}
            isSponsoredRatingFooterAllowed={isSponsoredRatingFooterAllowed}
            hideTileMetadata={hideTileMetadata}
            hoverStyle={hoverStyle}
            topicId={topicId}
            isInterestedUniverse={interestedUniverses?.has(data.universeId)}
            enableExplicitFeedback={enableExplicitFeedback}
            isHidden={hiddenUniverses?.has(data.universeId) ?? undefined}
            setIsHidden={setIsHidden(data.universeId)}
            toggleIsHidden={toggleIsHidden(data.universeId)}
            toggleInterest={toggleInterest ? () => toggleInterest(data.universeId) : undefined}
            page={page}
            enableSponsoredFeedback={enableSponsoredFeedback}
            sponsoredUserCohort={sponsoredUserCohort}
            enableReportAd={enableReportAd}
            sponsoredFooterAdLabelText={sponsoredFooterAdLabelText}
            sponsoredFooterAdLabelFirst={sponsoredFooterAdLabelFirst}
            sponsoredFooterIncludeRatingContent={sponsoredFooterIncludeRatingContent}
          />
        ))}
        {shouldUseSentinelTile && <SentinelTile loadData={loadData} />}
      </div>
    );
  },
);

GameGrid.displayName = "GameGrid";
GameGrid.defaultProps = {
  friendsPresence: [],
  componentType: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  isHomeGameGrid: false,
  isSponsoredFooterAllowed: undefined,
  isSponsoredRatingFooterAllowed: undefined,
  hideTileMetadata: undefined,
  sponsoredFooterAdLabelText: undefined,
  sponsoredFooterAdLabelFirst: undefined,
  sponsoredFooterIncludeRatingContent: undefined,
  hoverStyle: undefined,
  topicId: undefined,
  isDynamicLayoutSizingEnabled: undefined,
  interestedUniverses: undefined,
  toggleInterest: undefined,
};

export default GameGrid;
