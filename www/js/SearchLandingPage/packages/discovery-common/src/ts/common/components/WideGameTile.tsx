import classNames from "classnames";
import React, { Ref, useCallback, useMemo } from "react";
import { Button, Link } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import configConstants from "../constants/configConstants";
import { FeaturePlacesList } from "../constants/translationConstants";
import useFocused from "../hooks/useFocused";
import useGameTileOverflowMenu from "../hooks/useGameTileOverflowMenu";
import useReferralPlaceId from "../hooks/useReferralPlaceId";
import { TGameData, TGetFriendsResponse } from "../types/bedev1Types";
import {
  TComponentType,
  THoverStyle,
  TPlayButtonStyle,
  TPlayerCountStyle,
  TWideTileComponentType,
} from "../types/bedev2Types";
import browserUtils from "../utils/browserUtils";
import {
  getFriendVisits,
  getInGameFriends,
  getThumbnailOverrideAssetId,
  getVideoOverrideAssetId,
} from "../utils/parsingUtils";
import GameTileOverlayPill from "./GameTileOverlayPill";
import GameTilePlayButton from "./GameTilePlayButton";
import GameTileOverflowMenu, { getGameTileOverflowMenuItemsToShow } from "./GameTileOverflowMenu";
import {
  GameTileIconWithTextFooter,
  GameTileRatingContent,
  GameTileRatingFooter,
  GameTileRatingWithGenreFooter,
  GameTileStats,
  GameTileTextFooter,
  TBuildEventProperties,
  WideGameTileFacepileFooter,
} from "./GameTileUtils";
import WideGameTileSponsoredFooter from "./WideGameTileSponsoredFooter";
import { SponsoredFooterAdLabelText } from "../types/sponsoredTileTypes";
import WideGameThumbnail from "./WideGameThumbnail";
import GameTileVideoPlayer from "./GameTileVideoPlayer";
import useGetGameLayoutData from "../hooks/useGetGameLayoutData";
import {
  getGameTileRatingWithGenreFooterData,
  getGameTileTextFooterData,
} from "../utils/gameTileLayoutUtils";
import { PageContext } from "../types/pageContext";

const WideGameTileLinkWrapper = ({
  wrapperClassName,
  isTileClickEnabled,
  isOnScreen,
  linkUrl,
  children,
}: {
  wrapperClassName: string;
  isTileClickEnabled: boolean;
  isOnScreen: boolean;
  linkUrl: string;
  children: React.ReactNode;
}) => {
  if (isTileClickEnabled) {
    return (
      <Link url={linkUrl} className={wrapperClassName} tabIndex={isOnScreen ? 0 : -1}>
        {children}
      </Link>
    );
  }

  return <span className={wrapperClassName}>{children}</span>;
};

export type TWideGameTileProps = {
  gameData: TGameData;
  id: number;
  page?: PageContext;
  buildEventProperties: TBuildEventProperties;
  friendData?: TGetFriendsResponse[];
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: boolean;
  isSponsoredRatingFooterAllowed?: boolean;
  hideTileMetadata?: boolean;
  wideTileType: TWideTileComponentType;
  hoverStyle?: THoverStyle;
  topicId?: string;
  isOnScreen?: boolean;
  isInterestedUniverse?: boolean;
  enableExplicitFeedback?: boolean;
  setIsHidden?: (isHidden: boolean) => void;
  toggleIsHidden?: () => void;
  toggleInterest?: () => void;
  enableSponsoredFeedback?: boolean;
  sponsoredUserCohort?: string;
  enableReportAd?: boolean;
  sponsoredFooterAdLabelText?: string;
  sponsoredFooterAdLabelFirst?: boolean;
  sponsoredFooterIncludeRatingContent?: boolean;
  translate: TranslateFunction;
};

const WideGameTile = React.forwardRef(
  (
    {
      gameData,
      id,
      page,
      buildEventProperties,
      friendData = [],
      playerCountStyle,
      playButtonStyle,
      navigationRootPlaceId,
      isSponsoredFooterAllowed = false,
      isSponsoredRatingFooterAllowed = false,
      hideTileMetadata = false,
      wideTileType,
      hoverStyle,
      topicId,
      isOnScreen = true,
      isInterestedUniverse = undefined,
      enableExplicitFeedback = false,
      setIsHidden,
      toggleIsHidden,
      toggleInterest = undefined,
      enableSponsoredFeedback = false,
      sponsoredUserCohort,
      enableReportAd = false,
      sponsoredFooterAdLabelText,
      sponsoredFooterAdLabelFirst = true,
      sponsoredFooterIncludeRatingContent = false,
      translate,
    }: TWideGameTileProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    const doesSupportHover = window.matchMedia?.("(hover: hover)")?.matches ?? true;

    // InterestTiles are only presentational, so we disable clicks and hover states
    const isTileClickEnabled = wideTileType !== TComponentType.InterestTile;
    const isHoverEnabled = doesSupportHover && wideTileType !== TComponentType.InterestTile;

    const isFirstTile = id === 0;
    const isLastTile = id === configConstants.homePage.maxWideGameTilesPerCarouselPage - 1;
    const [isFocused, onFocus, onFocusLost] = useFocused();

    const referralPlaceId = useReferralPlaceId(gameData, navigationRootPlaceId);

    const clientReferralUrl = useMemo(() => {
      return browserUtils.buildGameDetailUrl(
        referralPlaceId,
        gameData.name,
        buildEventProperties(gameData, id),
        gameData.canonicalUrlPath,
      );
    }, [gameData, buildEventProperties, id, referralPlaceId]);

    const playButtonEventProperties = useMemo(
      () => buildEventProperties(gameData, id) as Record<string, string | number | undefined>,
      [buildEventProperties, gameData, id],
    );

    const friendsInGame = useMemo(
      () => getInGameFriends(friendData, gameData.universeId),
      [friendData, gameData.universeId],
    );

    const friendVisits = useMemo(
      () => getFriendVisits(friendData, gameData.friendVisits),
      [friendData, gameData.friendVisits],
    );

    const gameLayoutData = useGetGameLayoutData(gameData, topicId);

    const videoAssetId = useMemo(
      () => getVideoOverrideAssetId(gameData, topicId),
      [gameData, topicId],
    );

    const shouldShowVideo = videoAssetId && isFocused;

    const isPlayButtonVisible = useMemo((): boolean => {
      if (
        wideTileType === TComponentType.GridTile &&
        // HACK: This is a temporary fix to disable the play button on grid tiles by default
        // More info here: https://roblox.atlassian.net/browse/CLIGROW-2386.
        playButtonStyle !== TPlayButtonStyle.Enabled
      ) {
        return false;
      }
      if (
        wideTileType === TComponentType.EventTile &&
        playButtonStyle !== TPlayButtonStyle.Enabled
      ) {
        return false;
      }
      if (wideTileType === TComponentType.InterestTile) {
        return false;
      }
      return true;
    }, [wideTileType, playButtonStyle]);

    const hoverTileMetadata = useMemo((): JSX.Element | null => {
      if (
        gameData.minimumAge &&
        gameData.ageRecommendationDisplayName &&
        wideTileType !== TComponentType.EventTile &&
        isPlayButtonVisible
      ) {
        return (
          <div className="game-card-info" data-testid="game-tile-hover-age-rating">
            <span className="info-label">{gameData.ageRecommendationDisplayName}</span>
          </div>
        );
      }
      return null;
    }, [
      gameData.minimumAge,
      gameData.ageRecommendationDisplayName,
      wideTileType,
      isPlayButtonVisible,
    ]);

    const baseTileMetadata = useMemo((): JSX.Element => {
      if (isFocused && hoverStyle === THoverStyle.imageOverlay && hoverTileMetadata) {
        return hoverTileMetadata;
      }

      if (hideTileMetadata) {
        return <React.Fragment />;
      }

      const ratingElement = (
        <GameTileRatingContent
          totalUpVotes={gameData.totalUpVotes}
          totalDownVotes={gameData.totalDownVotes}
          translate={translate}
        />
      );

      if (gameData.isShowSponsoredLabel || (gameData.isSponsored && isSponsoredFooterAllowed)) {
        // isSponsoredRatingFooterAllowed is a legacy flag with override priority
        // that corresponds to "Ad" text followed by rating content. If
        // false, we pass through the values of sponsoredFooterAdLabelText,
        // sponsoredFooterAdLabelFirst, and sponsoredFooterIncludeRatingContent.
        const derivedAdLabelText = isSponsoredRatingFooterAllowed
          ? SponsoredFooterAdLabelText.Ad
          : sponsoredFooterAdLabelText;
        const derivedAdLabelFirst = isSponsoredRatingFooterAllowed || sponsoredFooterAdLabelFirst;
        const derivedIncludeRating =
          isSponsoredRatingFooterAllowed || sponsoredFooterIncludeRatingContent;

        return (
          <WideGameTileSponsoredFooter
            sponsoredFooterAdLabelText={derivedAdLabelText}
            sponsoredFooterAdLabelFirst={derivedAdLabelFirst}
            secondaryContent={derivedIncludeRating ? ratingElement : undefined}
            translate={translate}
          />
        );
      }

      const gameLayoutRatingWithGenreFooterData =
        getGameTileRatingWithGenreFooterData(gameLayoutData);
      if (gameLayoutRatingWithGenreFooterData) {
        return (
          <GameTileRatingWithGenreFooter
            footerData={gameLayoutRatingWithGenreFooterData}
            totalUpVotes={gameData.totalUpVotes}
            totalDownVotes={gameData.totalDownVotes}
          />
        );
      }

      const gameLayoutTextFooterData = getGameTileTextFooterData(gameLayoutData);
      if (gameLayoutTextFooterData) {
        return <GameTileTextFooter footerData={gameLayoutTextFooterData} />;
      }
      if (friendsInGame?.length > 0) {
        return <WideGameTileFacepileFooter friendsData={friendsInGame} isOnline />;
      }
      if (friendVisits?.length > 0) {
        return <WideGameTileFacepileFooter friendsData={friendVisits} isOnline={false} />;
      }
      if (gameData.friendVisitedString) {
        return (
          <GameTileIconWithTextFooter
            iconClassName="icon-pastname"
            text={gameData.friendVisitedString}
          />
        );
      }
      if (playerCountStyle === TPlayerCountStyle.Footer) {
        return (
          <GameTileStats
            totalUpVotes={gameData.totalUpVotes}
            totalDownVotes={gameData.totalDownVotes}
            playerCount={gameData.playerCount}
          />
        );
      }
      return <GameTileRatingFooter ratingElement={ratingElement} />;
    }, [
      isFocused,
      hoverStyle,
      hoverTileMetadata,
      hideTileMetadata,
      gameData.totalUpVotes,
      gameData.totalDownVotes,
      gameData.isShowSponsoredLabel,
      gameData.isSponsored,
      gameData.friendVisitedString,
      gameData.playerCount,
      translate,
      isSponsoredFooterAllowed,
      isSponsoredRatingFooterAllowed,
      sponsoredFooterAdLabelText,
      sponsoredFooterAdLabelFirst,
      sponsoredFooterIncludeRatingContent,
      gameLayoutData,
      friendsInGame,
      friendVisits,
      playerCountStyle,
    ]);

    const tileMetadata = useMemo(
      () => (
        <div className="wide-game-tile-metadata">
          <div className="base-metadata">{baseTileMetadata}</div>
          <div className="hover-metadata">{hoverTileMetadata}</div>
        </div>
      ),
      [baseTileMetadata, hoverTileMetadata],
    );

    const gameTitle = useMemo((): string => {
      if (gameLayoutData?.title) {
        return gameLayoutData.title;
      }

      return gameData.name;
    }, [gameData.name, gameLayoutData?.title]);

    const onInterestButtonClick = useCallback(() => {
      if (toggleInterest) {
        toggleInterest();
      }
    }, [toggleInterest]);

    const {
      overflowMenuOpen,
      sendGameTileOverflowMenuAction,
      closeOverflowMenu,
      toggleOverflowMenu,
    } = useGameTileOverflowMenu(gameData.universeId, topicId, page);

    const menuItemsToShow = useMemo(
      () =>
        getGameTileOverflowMenuItemsToShow({
          enableExplicitFeedback,
          setIsHidden,
          enableSponsoredFeedback,
          isSponsored: gameData.isSponsored,
          enableReportAd,
          encryptedAdTrackingData: gameData.nativeAdData,
        }),
      [
        enableExplicitFeedback,
        setIsHidden,
        enableSponsoredFeedback,
        gameData.isSponsored,
        enableReportAd,
        gameData.nativeAdData,
      ],
    );

    return (
      <li
        className={classNames(
          "list-item",
          "hover-game-tile",
          { "grid-tile": wideTileType === TComponentType.GridTile },
          { "event-tile": wideTileType === TComponentType.EventTile },
          { "interest-tile": wideTileType === TComponentType.InterestTile },
          { "first-tile": isFirstTile },
          { "last-tile": isLastTile },
          { "image-overlay": hoverStyle === THoverStyle.imageOverlay },
          { "old-hover": hoverStyle !== THoverStyle.imageOverlay },
          { focused: isFocused },
        )}
        data-testid="wide-game-tile"
        onMouseOver={isHoverEnabled ? onFocus : undefined}
        onMouseLeave={isHoverEnabled ? onFocusLost : undefined}
        onFocus={isHoverEnabled ? onFocus : undefined}
        onBlur={isHoverEnabled ? onFocusLost : undefined}
        id={gameData.universeId.toString()}
      >
        {gameData.universeId && (
          <div className="featured-game-container game-card-container" ref={ref}>
            <WideGameTileLinkWrapper
              wrapperClassName="game-card-link"
              isTileClickEnabled={isTileClickEnabled}
              isOnScreen={isOnScreen}
              linkUrl={clientReferralUrl}
            >
              <div className="featured-game-icon-container">
                <WideGameThumbnail
                  gameData={gameData}
                  topicId={topicId}
                  wideTileType={wideTileType}
                />
                {shouldShowVideo && (
                  <GameTileVideoPlayer
                    videoAssetId={videoAssetId}
                    universeId={gameData.universeId.toString()}
                    page={page}
                  />
                )}
                <GameTileOverlayPill
                  gameLayoutData={gameLayoutData}
                  playerCountStyle={playerCountStyle}
                  playerCount={gameData.playerCount}
                  isFocused={isFocused}
                />
                {menuItemsToShow.length > 0 && (isFocused || overflowMenuOpen) && (
                  <GameTileOverflowMenu
                    open={overflowMenuOpen}
                    menuItemsToShow={menuItemsToShow}
                    closeMenu={closeOverflowMenu}
                    toggleMenu={toggleOverflowMenu}
                    sendActionEvent={sendGameTileOverflowMenuAction}
                    universeId={gameData.universeId}
                    topicId={topicId}
                    page={page}
                    enableExplicitFeedback={enableExplicitFeedback}
                    setIsHidden={setIsHidden}
                    toggleIsHidden={toggleIsHidden}
                    enableSponsoredFeedback={enableSponsoredFeedback}
                    isSponsored={gameData.isSponsored}
                    payerName={gameData.payerName}
                    sponsoredUserCohort={sponsoredUserCohort}
                    enableReportAd={enableReportAd}
                    encryptedAdTrackingData={gameData.nativeAdData}
                    adCreativeAssetId={getThumbnailOverrideAssetId(gameData, topicId)?.toString()}
                    translate={translate}
                  />
                )}
              </div>
              <div className="info-container">
                <div className="info-metadata-container">
                  <div
                    className="game-card-name game-name-title"
                    data-testid="game-tile-game-title"
                    title={gameTitle}
                  >
                    {gameTitle}
                  </div>
                  {tileMetadata}
                </div>
                {isFocused && hoverStyle === THoverStyle.imageOverlay && isPlayButtonVisible && (
                  <div
                    data-testid="game-tile-hover-game-tile-contents"
                    className="play-button-container"
                  >
                    <GameTilePlayButton
                      universeId={gameData.universeId.toString()}
                      placeId={referralPlaceId.toString()}
                      playButtonEventProperties={playButtonEventProperties}
                      buttonClassName="btn-growth-xs play-button"
                      purchaseIconClassName="icon-robux-white"
                      clientReferralUrl={clientReferralUrl}
                      shouldPurchaseNavigateToDetails
                      page={page}
                    />
                  </div>
                )}
              </div>
            </WideGameTileLinkWrapper>
            {isFocused && hoverStyle !== THoverStyle.imageOverlay && isPlayButtonVisible && (
              <div data-testid="game-tile-hover-game-tile-contents" className="game-card-contents">
                <GameTilePlayButton
                  universeId={gameData.universeId.toString()}
                  placeId={referralPlaceId.toString()}
                  playButtonEventProperties={playButtonEventProperties}
                  buttonClassName="btn-growth-xs play-button"
                  purchaseIconClassName="icon-robux-white"
                  clientReferralUrl={clientReferralUrl}
                  shouldPurchaseNavigateToDetails
                  page={page}
                />
              </div>
            )}
            {wideTileType === TComponentType.InterestTile && (
              <Button
                data-testid="tile-interest-button"
                className="tile-interest-button"
                variant={Button.variants.primary}
                size={Button.sizes.medium}
                title={translate(FeaturePlacesList.ActionInterestCatcherInterested)}
                onClick={onInterestButtonClick}
              >
                {isInterestedUniverse ? (
                  <span className="icon-heart-red" />
                ) : (
                  <span className="icon-heart" />
                )}
                <span>{translate(FeaturePlacesList.ActionInterestCatcherInterested)}</span>
              </Button>
            )}
          </div>
        )}
      </li>
    );
  },
);

WideGameTile.displayName = "WideGameTile";
export default WideGameTile;
