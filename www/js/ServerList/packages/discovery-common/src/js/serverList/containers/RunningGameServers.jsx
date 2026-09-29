import React from "react";
import PropTypes from "prop-types";
import { withTranslations } from "@rbx/core-scripts/react";
import useServerList from "./useServerList";
import translationConfig from "../translation.config";
import GameListSection from "../components/GameListSection";
import { serverListMetadataPropType } from "../constants/sharedPropTypes";
import serverListConstants from "../constants/serverListConstants";
import serverListService from "../services/serverListService";
import useServerCardMetaExperiment from "../../../ts/serverList/hooks/useServerCardMetaExperiment";

const { serverListTypes } = serverListConstants;

function RunningGameServers({
  type,
  translate,
  headerTitleResource,
  getGameServers,
  serverListMetadata,
  isAuthenticated = false,
}) {
  const { placeId, placeName, price, sellerName, universeId, userCanManagePlace } =
    serverListMetadata;
  const {
    isServerCardPingIconEnabled,
    isServerCardLanguageIconEnabled,
    isServerCardFriendsIconEnabled,
    isFriendsServerListV2Enabled,
    isLoading: isExperimentLoading,
  } = useServerCardMetaExperiment();
  const isFriends = type === serverListTypes.friend.key;
  const resolvedGetGameServers = isFriends
    ? isFriendsServerListV2Enabled
      ? serverListService.getFriendsGameInstancesV2
      : serverListService.getFriendsGameInstances
    : getGameServers;

  const {
    servers,
    loadMoreServers,
    refreshServers,
    removeServerAtIndex,
    hasNext,
    isBusy,
    setIsBusy,
    hasError,
  } = useServerList(resolvedGetGameServers, false, placeId);

  return (
    <GameListSection
      {...{
        type,
        placeId,
        gameInstances: servers,
        headerTitle: translate(headerTitleResource),
        showLoadMoreButton: hasNext,
        loadMoreGameInstances: loadMoreServers,
        refreshGameInstances: refreshServers,
        handleGameInstanceShutdownAtIndex: removeServerAtIndex,
        userCanManagePlace,
        isLoading: isBusy,
        setIsLoading: setIsBusy,
        loadingError: hasError,
        placeName,
        price,
        creatorName: sellerName,
        universeId,
        isAuthenticated,
        isServerCardPingIconEnabled,
        isServerCardLanguageIconEnabled,
        isServerCardFriendsIconEnabled,
        deferFetch: isFriends && isExperimentLoading,
      }}
    />
  );
}

RunningGameServers.propTypes = {
  type: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
  headerTitleResource: PropTypes.string.isRequired,
  getGameServers: PropTypes.func.isRequired,
  serverListMetadata: serverListMetadataPropType.isRequired,
  isAuthenticated: PropTypes.bool,
};

export default withTranslations(RunningGameServers, translationConfig.serverList);
