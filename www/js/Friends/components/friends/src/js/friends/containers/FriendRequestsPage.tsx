import React, { useContext } from "react";
import TrustedFriendRequestsSection from "../components/TrustedFriendRequestsSection";
import { FriendsMetadataContext } from "../context/friendsMetadataContext";
import PaginatedFriends from "./PaginatedFriends";

type FriendRequestsPageProps = {
  title: string;
  currentTab: string;
  tooltipMsg: string;
};

const FriendRequestsPage = ({
  title,
  currentTab,
  tooltipMsg,
}: FriendRequestsPageProps): JSX.Element => {
  const { canAccessTrustedConnections } = useContext(FriendsMetadataContext);

  return (
    <React.Fragment>
      {canAccessTrustedConnections === true ? <TrustedFriendRequestsSection /> : null}
      <PaginatedFriends title={title} currentTab={currentTab} tooltipMsg={tooltipMsg} />
    </React.Fragment>
  );
};

export default FriendRequestsPage;
