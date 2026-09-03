import React from "react";
import { Loading } from "react-style-guide";
import { TBlockManagerType } from "../../../../types/privacyTypes";
import { Access } from "../../../../types/accessManagementTypes";
import { useGetFeatureAccessQuery } from "../../../apis/accessManagementApi";
import AMPFeaturesConstants from "../../constants/AMPFeaturesConstants";
import BlockedUsersList from "./BlockedUsersList";
import { useGetParentInfoQuery } from "../../../apis/parentalControlsApi";
import { useGetBlockedUsersQuery } from "../../../apis/userBlockingApi";
import { blockedUsersPageSize } from "../../constants/privacy/privacyConstants";

export const BlockedUsers = (): JSX.Element => {
  const { data: canParentManageChildsFriendsResult, isLoading } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.CanParentManageChildsFriends,
  });
  const { data: parentBlockedUsers } = useGetBlockedUsersQuery({
    cursor: "",
    count: blockedUsersPageSize,
    managerTypeFilter: TBlockManagerType.Parent,
  });

  const hasParentBlockedUsers =
    parentBlockedUsers?.data.blockedUsers && parentBlockedUsers?.data.blockedUsers.length > 0;

  const { data: parentData } = useGetParentInfoQuery();
  const hasLinkedParents = parentData?.parents && parentData?.parents.length > 0;

  const displaySeparatedBlocks =
    canParentManageChildsFriendsResult?.access === Access.Granted &&
    (hasParentBlockedUsers || hasLinkedParents);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <React.Fragment>
      {displaySeparatedBlocks ? (
        <BlockedUsersList shouldShowParentalRelationshipView />
      ) : (
        <BlockedUsersList />
      )}
    </React.Fragment>
  );
};
export default BlockedUsers;
