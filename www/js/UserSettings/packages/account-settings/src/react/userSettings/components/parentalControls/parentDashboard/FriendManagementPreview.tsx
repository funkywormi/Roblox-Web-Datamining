import React from "react";
import { useAppSelector } from "../../../../redux/hooks";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import FriendsPreviewCard from "../shared/FriendsPreviewCard";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";

const FriendManagementPreview = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { userId: childUserId, canParentManageChildsFriends = false } = child;

  const childPages = useAppSelector(selectChildPagesForChildUserId(childUserId));
  const { translate } = useWrappedTranslation();

  return (
    <FriendsPreviewCard
      userId={childUserId}
      linkText={translate(
        canParentManageChildsFriends
          ? commonTranslationConstants.manage
          : parentalControlsTranslationConstants.friendManagement.more,
      )}
      linkPath={childPages?.friendManagementPage.path}
      onLinkClick={() => {
        parentalControlsEventService.authButtonClickSettingsPControlsConnectionsMore(child);
      }}
    />
  );
};

export default FriendManagementPreview;
