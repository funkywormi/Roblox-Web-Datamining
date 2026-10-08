import { useRef, useState } from "react";
import { userId } from "@rbx/core-scripts/meta/user";
import { startWizard } from "@rbx/amp-v2-wizard";
import { ManagementAction } from "../../../../../../types/parentConsentsTypes";
import { FindFriendsTypes, FindFriendsUserSort } from "../../../../../../types/friendsTypes";
import { parentalControlsApi } from "../../../../../apis/parentalControlsApi";
import { useAppDispatch } from "../../../../../redux/hooks";

const useManageOdpFriend = () => {
  const dispatch = useAppDispatch();
  const isWizardActiveRef = useRef(false);
  const [isManaging, setIsManaging] = useState(false);

  const manageFriend = async (
    friendUserId: number,
    action: ManagementAction.Block | ManagementAction.Unblock,
  ): Promise<void> => {
    const childUserId = userId();
    if (isWizardActiveRef.current || childUserId === null) {
      return;
    }
    isWizardActiveRef.current = true;
    setIsManaging(true);
    try {
      await startWizard({
        flow: {
          name: "ODP",
          props: {
            requestType: "ManageFriend",
            requestDetails: {
              friendUserId: String(friendUserId),
              friendManagementAction: action,
            },
            isOdpInitiated: true,
          },
        },
        surface: "ParentalControlsSettings",
      }).catch(() => undefined);
    } finally {
      // Refetch the first page. Invalidating the tag refetches the last page loaded.
      dispatch(
        parentalControlsApi.endpoints.getChildFriends.initiate(
          {
            userId: childUserId,
            userSort: FindFriendsUserSort.FriendScore,
            findFriendsType: FindFriendsTypes.Friends,
          },
          { subscribe: false, forceRefetch: true },
        ),
      );
      isWizardActiveRef.current = false;
      setIsManaging(false);
    }
  };

  return { manageFriend, isManaging };
};

export default useManageOdpFriend;
