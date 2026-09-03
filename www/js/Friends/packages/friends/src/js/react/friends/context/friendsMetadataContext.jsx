import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const FriendsMetadataContext = createContext();

const FriendsMetadataContextProvider = ({ children }) => {
  const [friendsCount, setFriendsCount] = useState(0);
  const [friendsNameFilter, setFriendsNameFilter] = useState(null);
  const [friendsStatusFilter, setFriendsStatusFilter] = useState(null);
  const [friendsSort, setFriendsSort] = useState(null); // TODO: Cover default sort in unit test: https://jira.rbx.com/browse/SOCCONN-167
  const [paginatedFriends, setPaginatedFriends] = useState([]);
  const [filterBarEnabled, setFilterBarEnabled] = useState(null);
  const [isTrustedFilterEnabled, setIsTrustedFilterEnabled] = useState(false);
  const [trustedConnectionsAmpPolicyLoaded, setTrustedConnectionsAmpPolicyLoaded] = useState(false);
  const [canAccessTrustedConnections, setCanAccessTrustedConnections] = useState(false);
  const [isTcManagementHubEnabled, setIsTcManagementHubEnabled] = useState(false);
  const [
    showJoinGameButtonInFriendCardDesktopOnly,
    setShowJoinGameButtonInFriendCardDesktopOnly
  ] = useState(false);
  const [friendRequestIdToUniverseSourceMap, setFriendRequestIdToUniverseSourceMap] = useState({});
  const [showFriendRecs, setShowFriendRecs] = useState(true);

  const friendsMetadataState = {
    friendsCount,
    setFriendsCount,
    friendsNameFilter,
    setFriendsNameFilter,
    friendsStatusFilter,
    setFriendsStatusFilter,
    friendsSort,
    setFriendsSort,
    paginatedFriends,
    setPaginatedFriends,
    filterBarEnabled,
    setFilterBarEnabled,
    showJoinGameButtonInFriendCardDesktopOnly,
    setShowJoinGameButtonInFriendCardDesktopOnly,
    friendRequestIdToUniverseSourceMap,
    setFriendRequestIdToUniverseSourceMap,
    showFriendRecs,
    setShowFriendRecs,
    isTrustedFilterEnabled,
    setIsTrustedFilterEnabled,
    trustedConnectionsAmpPolicyLoaded,
    setTrustedConnectionsAmpPolicyLoaded,
    canAccessTrustedConnections,
    setCanAccessTrustedConnections,
    isTcManagementHubEnabled,
    setIsTcManagementHubEnabled
  };
  return (
    <FriendsMetadataContext.Provider value={friendsMetadataState}>
      {children}
    </FriendsMetadataContext.Provider>
  );
};

FriendsMetadataContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { FriendsMetadataContext, FriendsMetadataContextProvider };
