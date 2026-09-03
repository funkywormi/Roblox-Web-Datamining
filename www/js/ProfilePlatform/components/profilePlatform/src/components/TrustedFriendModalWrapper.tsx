import { useState } from "react";
import {
  TrustedFriendsModal,
  TrustedFriendsErrorModal,
  TrustedFriendsErrorModalKind,
} from "@rbx/friends-common";
import { TrustedFriendModalType } from "@rbx/profile-platform";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";
import useProfileJsonComponent from "../hooks/useProfileJsonComponent";

const TrustedFriendModalWrapper = () => {
  const { profileId, refreshProfilePlatform } = useProfilePlatformContext();
  const componentData = useProfileJsonComponent("TrustedFriendModal");
  const [open, setOpen] = useState(true);

  if (componentData?.trustedFriendModalType === TrustedFriendModalType.AddTrustedFriendsModal) {
    return (
      <TrustedFriendsModal
        open={open}
        onClose={() => {
          setOpen(false);
          refreshProfilePlatform().catch(() => undefined);
        }}
        userId={Number(profileId)}
        linkTokens={componentData.friendRequestTokens}
      />
    );
  } else {
    const errorType =
      componentData?.trustedFriendModalType === TrustedFriendModalType.InvalidLinkModal
        ? TrustedFriendsErrorModalKind.Invalid
        : TrustedFriendsErrorModalKind.Expired;
    return (
      <TrustedFriendsErrorModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        errorType={errorType}
      />
    );
  }
};

export default TrustedFriendModalWrapper;
