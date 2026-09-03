import React, { Fragment, useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";
import { createSystemFeedback, Button, Loading } from "@rbx/core-ui";
import { withTranslations } from "@rbx/core-scripts/react";

import GameInstanceCard from "../containers/GameInstanceCard";
import ServerListOptions from "../../../ts/serverList/ServerListOptions";
import serverListConstants from "../constants/serverListConstants";
import translationConfig from "../translation.config";

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
const {
  slowGameFpsThreshold,
  resources,
  numGameInstancesPerRow,
  defaultOptions,
  serverListTypes,
  orderByOptions,
} = serverListConstants;

// The default sort for the public section depends on whether the user is signed
// in. Non-public sections use the shared defaults.
function getSectionDefaultOptions(isPublic, isAuthenticated) {
  if (!isPublic) {
    return defaultOptions;
  }
  return {
    ...defaultOptions,
    orderBy: isAuthenticated ? orderByOptions.recommended : orderByOptions.occupancyDesc,
    excludeFullGames: true,
  };
}

function GameListSection({
  gameInstances,
  handleGameInstanceShutdownAtIndex,
  headerTitle,
  isLoading,
  loadMoreGameInstances,
  loadingError,
  placeId,
  refreshGameInstances,
  setIsLoading,
  showLoadMoreButton,
  translate,
  type,
  userCanManagePlace,
  privateServerNewJoinsDisallowed,
  placeName,
  price,
  creatorName,
  universeId,
  isAuthenticated = false,
}) {
  const cssKey = `${type}-`;
  const emptyGameInstanceList = gameInstances.length === 0;
  const footerClass = `rbx-${cssKey}running-games-footer`;
  const id = `rbx-${cssKey}running-games`;
  const itemContainerClass = `card-list rbx-${cssKey}game-server-item-container`;
  const itemContainerId = `rbx-${cssKey}game-server-item-container`;

  const displayedGameInstances = useMemo(() => {
    // We display N items in a row in this UI treatment, but we fetch 10 at a time from the API,
    // and deduplicate ones that are returned more than once due to changes in server ordering on the backend.
    // To ensure users see full rows when possible, we slice the list such that it's a multiple of N, unless
    // we are at the end of the list (showLoadMoreButton corresponds to this). The servers aren't ever removed
    // from the original list, just saved until next time.
    const extraGameInstances = gameInstances.length % numGameInstancesPerRow;
    if (extraGameInstances > 0 && showLoadMoreButton) {
      return gameInstances.slice(0, -1 * extraGameInstances);
    }
    return gameInstances;
  }, [gameInstances, showLoadMoreButton]);

  const isPublic = type === serverListTypes.public.key;

  // The correct default sort is known up front, so the list is fetched exactly
  // once with it (firing a second refresh while the first is in flight makes
  // useServerList throw).
  const [options, setOptions] = useState(() => getSectionDefaultOptions(isPublic, isAuthenticated));

  useEffect(() => {
    refreshGameInstances?.(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <Fragment>
      <SystemFeedback />
      <div id={id} className="stack server-list-section" data-placeid={placeId} data-showshutdown>
        {headerTitle && (
          <div className="container-header">
            <div className="server-list-container-header">
              <h2 className="server-list-header">{headerTitle}</h2>
              <Button
                className="btn-more rbx-refresh refresh-link-icon"
                isDisabled={isLoading}
                onClick={() => refreshGameInstances(options)}
                size={Button.sizes.extraSmall}
                variant={Button.variants.control}
              >
                {translate(resources.privateServerRefreshText) || "Refresh"}
              </Button>
            </div>
            {isPublic && (
              <ServerListOptions
                {...{
                  isLoading,
                  options,
                  setOptions,
                  translate,
                  isAuthenticated,
                }}
              />
            )}
          </div>
        )}

        {emptyGameInstanceList ? (
          <div className="section-content-off empty-game-instances-container">
            {isLoading ? (
              <Loading />
            ) : (
              <p className="no-servers-message">
                {loadingError
                  ? translate(resources.loadServersError) || "Unable to load servers."
                  : translate(resources.noServersFoundText)}
              </p>
            )}
          </div>
        ) : (
          <Fragment>
            <ul id={itemContainerId} className={itemContainerClass}>
              {displayedGameInstances.map(
                (
                  {
                    accessCode,
                    id: instanceId,
                    maxPlayers,
                    name,
                    owner,
                    pfs, // TODO(SHARE-414): Is this information that we actually get from the backend? Let's remove if not.
                    players,
                    playing,
                    vipServerId,
                    vipServerSubscription,
                  },
                  index,
                ) => (
                  <GameInstanceCard
                    key={vipServerId}
                    {...{
                      accessCode,
                      canManagePlace: userCanManagePlace,
                      cssKey,
                      currentPlayersCount: playing || players.length,
                      gameServerStatus: translate(resources.playerCountText, {
                        currentPlayers: playing || players.length,
                        maximumAllowedPlayers: maxPlayers,
                      }),
                      id: instanceId,
                      isLoading,
                      maxPlayers,
                      name,
                      onShutdownServerSuccess: () => {
                        handleGameInstanceShutdownAtIndex(index);
                      },
                      owner,
                      placeId,
                      players,
                      serverListType: type,
                      setIsLoading,
                      showSlowGameMessage: pfs < slowGameFpsThreshold,
                      systemFeedbackService,
                      translate,
                      vipServerId,
                      vipServerSubscription,
                      privateServerNewJoinsDisallowed,
                      placeName,
                      price,
                      creatorName,
                      universeId,
                    }}
                  />
                ),
              )}
            </ul>
            <div className={footerClass}>
              {showLoadMoreButton && (
                <Button
                  className="rbx-running-games-load-more"
                  isDisabled={isLoading}
                  onClick={() => loadMoreGameInstances(options)}
                  type="button"
                  variant={Button.variants.control}
                  width={Button.widths.full}
                >
                  {translate(resources.loadMoreButtonText)}
                </Button>
              )}
            </div>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}

GameListSection.defaultProps = {
  showLoadMoreButton: false,
  loadMoreButtonText: "",
  headerTitle: "",
  gameInstances: [],
  privateServerNewJoinsDisallowed: false,
  isAuthenticated: false,
};

GameListSection.propTypes = {
  translate: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  placeId: PropTypes.number.isRequired,
  headerTitle: PropTypes.string,
  loadMoreGameInstances: PropTypes.func.isRequired,
  showLoadMoreButton: PropTypes.bool,
  loadMoreButtonText: PropTypes.string,
  gameInstances: PropTypes.arrayOf(PropTypes.any),
  refreshGameInstances: PropTypes.func.isRequired,
  handleGameInstanceShutdownAtIndex: PropTypes.func.isRequired,
  userCanManagePlace: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  loadingError: PropTypes.bool.isRequired,
  privateServerNewJoinsDisallowed: PropTypes.bool,
  isAuthenticated: PropTypes.bool,
  placeName: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  creatorName: PropTypes.string.isRequired,
  universeId: PropTypes.number.isRequired,
};

export default withTranslations(GameListSection, translationConfig.serverList);
