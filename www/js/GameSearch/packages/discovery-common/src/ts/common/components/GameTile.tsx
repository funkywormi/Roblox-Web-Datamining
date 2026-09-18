import React, { Ref, forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TranslateFunction, queryClient } from "@rbx/core-scripts/react";
import "../../../css/common/_gameTiles.scss";
import "../../../css/gameCarousel/_tooltip.scss";
import useFocused from "../hooks/useFocused";
import useGetGameLayoutData from "../hooks/useGetGameLayoutData";
import useGameTileOverflowMenu from "../hooks/useGameTileOverflowMenu";
import { useGameFavoriteStatus } from "../hooks/useGameFavoriteStatus";
import bedev1Services from "../services/bedev1Services";
import { GameFavoriteStatusMutationError } from "../services/gamesFavoriteService";
import { TGetFriendsResponse, TGetPlaceDetails } from "../types/bedev1Types";
import { THoverStyle } from "../types/bedev2Types";
import { PageContext } from "../types/pageContext";
import {
  getGameTileRatingWithGenreFooterData,
  getGameTileTextFooterData,
} from "../utils/gameTileLayoutUtils";
import { getInGameFriends } from "../utils/parsingUtils";
import GameTileOverflowMenu, { getGameTileOverflowMenuItemsToShow } from "./GameTileOverflowMenu";
import GameTileHidden from "./GameTileHidden";
import {
  GameTileBase,
  GameTileFriendActivityFooter,
  GameTileFriendsInGame,
  GameTileHiddenReason,
  GameTileRatingWithGenreFooter,
  GameTileSponsoredFooter,
  GameTileStats,
  GameTileTextFooter,
  TSharedGameTileProps,
} from "./GameTileUtils";

export type TGameTileProps = TSharedGameTileProps & {
  friendData?: TGetFriendsResponse[];
  className?: string;
  page?: PageContext;
  isOnScreen?: boolean;
  isSponsoredFooterAllowed?: boolean;
  hideTileMetadata?: boolean;
  hoverStyle?: THoverStyle;
  enableRemoveFromFavorites?: boolean;
  onRemoveFromFavorites?: () => void;
  hiddenReason?: GameTileHiddenReason.RemovedFromFavorites;
  onUndoRemoveFromFavorites?: () => void;
  onFavoriteStatusMutationError?: (confirmedIsFavorited: boolean) => void;
  translate: TranslateFunction;
};

const GameTileContent = forwardRef<HTMLDivElement, TGameTileProps>(
  (
    {
      id,
      buildEventProperties,
      gameData,
      page = PageContext.HomePage,
      className = "grid-item-container game-card-container",
      friendData = [],
      isOnScreen = true,
      hideTileMetadata = false,
      isSponsoredFooterAllowed = false,
      topicId,
      enableRemoveFromFavorites = false,
      onRemoveFromFavorites,
      hiddenReason,
      onUndoRemoveFromFavorites,
      onFavoriteStatusMutationError,
      translate,
    }: TGameTileProps,
    ref: Ref<HTMLDivElement>,
  ): JSX.Element => {
    const [gameDetails, setGameDetails] = useState<TGetPlaceDetails | undefined>();
    const [isFocused, onFocus, onFocusLost] = useFocused();

    const friendsInGame = useMemo(
      () => getInGameFriends(friendData, gameData.universeId),
      [friendData, gameData.universeId],
    );
    const gameLayoutData = useGetGameLayoutData(gameData, topicId);

    const {
      overflowMenuOpen,
      sendGameTileOverflowMenuAction,
      closeOverflowMenu,
      toggleOverflowMenu,
    } = useGameTileOverflowMenu(gameData.universeId, topicId, page);

    const { mutateAsync: setFavoriteStatus } = useGameFavoriteStatus(gameData.universeId, true);

    const handleFavoriteStatusMutationError = useCallback(
      (error: unknown, attemptedIsFavorited: boolean) => {
        if (error instanceof GameFavoriteStatusMutationError && error.hasNewerPendingAction) {
          return;
        }
        const confirmedIsFavorited =
          error instanceof GameFavoriteStatusMutationError
            ? error.confirmedIsFavorited
            : !attemptedIsFavorited;
        onFavoriteStatusMutationError?.(confirmedIsFavorited);
      },
      [onFavoriteStatusMutationError],
    );

    // Use mutateAsync (not mutate(value, {onError})): react-query's mutate() options are
    // stored on the shared mutation observer, so a Remove immediately followed by an Undo
    // (the exact sequence this feature needs to support) detaches the observer from the
    // first mutation and silently drops its onError callback. mutateAsync's returned
    // promise is unaffected by that detachment.
    const handleRemoveFromFavorites = useCallback(() => {
      onRemoveFromFavorites?.();
      setFavoriteStatus(false).catch(error => handleFavoriteStatusMutationError(error, false));
    }, [onRemoveFromFavorites, setFavoriteStatus, handleFavoriteStatusMutationError]);

    const handleUndoRemoveFromFavorites = useCallback(() => {
      onUndoRemoveFromFavorites?.();
      setFavoriteStatus(true).catch(error => handleFavoriteStatusMutationError(error, true));
    }, [onUndoRemoveFromFavorites, setFavoriteStatus, handleFavoriteStatusMutationError]);

    const menuItemsToShow = useMemo(
      () =>
        getGameTileOverflowMenuItemsToShow({
          enableRemoveFromFavorites,
          onRemoveFromFavorites: handleRemoveFromFavorites,
        }),
      [enableRemoveFromFavorites, handleRemoveFromFavorites],
    );

    useEffect(() => {
      const fetchGameDetails = async () => {
        try {
          const response = await bedev1Services.getPlaceDetails(gameData.placeId.toString());
          setGameDetails(response);
        } catch (e) {
          console.error(e);
        }
      };
      if (gameDetails === undefined && friendsInGame.length > 0) {
        // eslint-disable-next-line no-void
        void fetchGameDetails();
      }
    }, [friendsInGame, gameDetails]);

    const getGameTileContent = (): JSX.Element => {
      if (hideTileMetadata) {
        return <React.Fragment />;
      }

      if (gameData?.isShowSponsoredLabel || (gameData?.isSponsored && isSponsoredFooterAllowed)) {
        return <GameTileSponsoredFooter translate={translate} />;
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
      if (friendsInGame.length > 0 && gameDetails) {
        return <GameTileFriendsInGame friendData={friendsInGame} gameData={gameDetails} />;
      }
      if (gameData?.friendActivityTitle) {
        return <GameTileFriendActivityFooter footerText={gameData.friendActivityTitle} />;
      }
      return (
        <GameTileStats
          totalUpVotes={gameData.totalUpVotes}
          totalDownVotes={gameData.totalDownVotes}
          playerCount={gameData.playerCount}
        />
      );
    };

    return (
      <div
        ref={ref}
        className={className}
        data-testid="game-tile"
        onMouseOver={onFocus}
        onMouseLeave={onFocusLost}
        onFocus={onFocus}
        onBlur={onFocusLost}
      >
        {hiddenReason ? (
          <GameTileHidden
            translate={translate}
            reason={hiddenReason}
            universeId={gameData.universeId}
            topicId={topicId}
            page={page}
            onUndo={handleUndoRemoveFromFavorites}
          />
        ) : (
          <React.Fragment>
            <GameTileBase
              id={id}
              isOnScreen={isOnScreen}
              buildEventProperties={buildEventProperties}
              gameData={gameData}
              page={page}
              isFocused={isFocused}
              topicId={topicId}
            >
              {getGameTileContent()}
            </GameTileBase>
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
                onRemoveFromFavorites={handleRemoveFromFavorites}
                translate={translate}
              />
            )}
          </React.Fragment>
        )}
      </div>
    );
  },
);
GameTileContent.displayName = "GameTileContent";

export const GameTile = forwardRef<HTMLDivElement, TGameTileProps>((props, ref) => (
  <QueryClientProvider client={queryClient}>
    <GameTileContent {...props} ref={ref} />
  </QueryClientProvider>
));
GameTile.displayName = "GameTile";
export default GameTile;
