import React, { Ref, forwardRef, useEffect, useMemo, useState } from "react";
import { Link } from "@rbx/core-ui";
import {
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailGameIconSize,
  ThumbnailGameThumbnailSize,
  ThumbnailTypes,
} from "@rbx/thumbnails";
import "../../../css/common/_gameTiles.scss";
import { isValidHttpUrl } from "@rbx/core-scripts/util/url";
import classNames from "classnames";
import useFocused from "../hooks/useFocused";
import useFriendsPresence from "../hooks/useFriendsPresence";
import useGetGameLayoutData from "../hooks/useGetGameLayoutData";
import bedev1Services from "../services/bedev1Services";
import { TGameData, TGetPlaceDetails, TLayoutMetadata } from "../types/bedev1Types";
import { buildGameDetailUrl } from "../utils/browserUtils";
import { getInGameFriends, isWideTileComponentType } from "../utils/parsingUtils";
import { CreatorLabel } from "./CreatorLabel";
import GameTileOverlayPill from "./GameTileOverlayPill";
import GameTilePlayButtonV2 from "./GameTilePlayButtonV2";
import WideGameThumbnail from "./WideGameThumbnail";
import {
  GameTileFriendsInGame,
  GameTileRatingWithGenreFooter,
  GameTileStats,
  GameTileTextFooter,
  TSharedGameTileProps,
} from "./GameTileUtils";
import {
  getGameTileRatingWithGenreFooterData,
  getGameTileTextFooterData,
} from "../utils/gameTileLayoutUtils";
import { TComponentType } from "../types/bedev2Types";
import type { PageContext } from "../types/pageContext";

const FeaturedGameTileFooter = ({
  gameLayoutData,
  gameData,
}: {
  gameLayoutData: TLayoutMetadata | undefined;
  gameData: TGameData;
}): JSX.Element => {
  const ratingWithGenreFooterData = getGameTileRatingWithGenreFooterData(gameLayoutData);
  if (ratingWithGenreFooterData) {
    return (
      <GameTileRatingWithGenreFooter
        footerData={ratingWithGenreFooterData}
        totalUpVotes={gameData.totalUpVotes}
        totalDownVotes={gameData.totalDownVotes}
      />
    );
  }

  const textFooterData = getGameTileTextFooterData(gameLayoutData);
  if (textFooterData) {
    return <GameTileTextFooter footerData={textFooterData} />;
  }

  return (
    <GameTileStats
      totalUpVotes={gameData.totalUpVotes}
      totalDownVotes={gameData.totalDownVotes}
      playerCount={gameData.playerCount}
    />
  );
};

export const FeaturedGridTile = forwardRef(
  (
    {
      id,
      buildEventProperties,
      gameData,
      translate,
      topicId,
      componentType,
      page,
    }: TSharedGameTileProps & {
      componentType?: TComponentType;
      page?: PageContext;
    },
    ref: Ref<HTMLDivElement>,
  ): JSX.Element => {
    const [game, setGame] = useState<TGetPlaceDetails | undefined>();
    const [isFocused, onFocus, onFocusLost] = useFocused();

    const friendsData = useFriendsPresence();
    const gameLayoutData = useGetGameLayoutData(gameData, topicId);

    const friendsDataInGame = useMemo(
      () => getInGameFriends(friendsData, gameData.universeId),
      [friendsData, gameData.universeId],
    );

    const cardDescription = useMemo(() => {
      if (friendsDataInGame.length > 0 && game) {
        return (
          <GameTileFriendsInGame
            gameData={game}
            friendData={friendsDataInGame}
            translate={translate}
          />
        );
      }
      return (
        <div
          className="game-card-description-info font-body"
          data-testid="featured-grid-tile-description"
        >
          {game?.description}
        </div>
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [friendsDataInGame]);

    useEffect(() => {
      const fetchGameDetails = async () => {
        try {
          const response = await bedev1Services.getPlaceDetails(gameData.placeId.toString());
          setGame(response);
        } catch (e) {
          console.error(e);
        }
      };
      // eslint-disable-next-line no-void
      void fetchGameDetails();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const linkUrl = buildGameDetailUrl(
      gameData.placeId,
      gameData.name,
      buildEventProperties(gameData, id),
      gameData.canonicalUrlPath,
    );

    const playButtonEventProperties = buildEventProperties(gameData, id) as Record<
      string,
      string | number | undefined
    >;

    const isWideTile = isWideTileComponentType(componentType);

    const thumbnailComponent = useMemo(() => {
      if (isWideTileComponentType(componentType)) {
        return (
          <div className="game-card-thumb-container">
            <WideGameThumbnail
              gameData={gameData}
              topicId={topicId}
              wideTileType={componentType}
              sizeOverride={ThumbnailGameThumbnailSize.width768}
            />
          </div>
        );
      }
      return (
        <Thumbnail2d
          type={ThumbnailTypes.gameIcon}
          size={ThumbnailGameIconSize.size512}
          targetId={gameData.universeId}
          containerClass="game-card-thumb-container"
          format={ThumbnailFormat.jpeg}
          altName={gameData.name}
        />
      );
    }, [gameData, topicId, componentType]);

    return (
      <div
        ref={ref}
        className={classNames("featured-grid-item-container game-card-container", {
          "wide-featured-tile": isWideTile,
        })}
        data-testid="game-tile-featured"
        onMouseOver={onFocus}
        onMouseLeave={onFocusLost}
        onFocus={onFocus}
        onBlur={onFocusLost}
      >
        <Link url={linkUrl} className="game-card-link" id={gameData.universeId.toString()}>
          <GameTileOverlayPill gameLayoutData={gameLayoutData} isFocused={isFocused} />
          {thumbnailComponent}
          <div className="game-card-name-info">
            <div>
              <div className="game-card-name game-name-title" title={gameData.name}>
                {gameData.name}
              </div>
              <FeaturedGameTileFooter gameLayoutData={gameLayoutData} gameData={gameData} />
            </div>
            <GameTilePlayButtonV2
              universeId={gameData.universeId.toString()}
              placeId={gameData.placeId.toString()}
              playButtonEventProperties={playButtonEventProperties}
              redirectPurchaseUrl={isValidHttpUrl(linkUrl) ? linkUrl : undefined}
              page={page}
            />
          </div>
          {gameData.creatorName !== null && (
            <CreatorLabel
              universeId={gameData.universeId.toString()}
              creatorId={gameData.creatorId}
              creatorType={gameData.creatorType}
              creatorName={gameData.creatorName}
              isCreatorVerified={gameData.creatorHasVerifiedBadge ?? false}
              linkUrl={linkUrl}
              translate={translate}
            />
          )}
          {cardDescription}
        </Link>
      </div>
    );
  },
);
FeaturedGridTile.displayName = "FeaturedGridTile";
export default FeaturedGridTile;
