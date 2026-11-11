import React from "react";
import { AccessManagementUpsellV2Service } from "Roblox";
import {
  Thumbnail2d,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
  ThumbnailTypes,
} from "@rbx/thumbnails";
import { UserProfileField, useUserProfiles } from "@rbx/user-profile-api-client";
import TrustedFriendsModal, { type TrustedFriendsModalProps } from "./TrustedFriendsModal";
import {
  TrustedFriendsModalHostContext,
  type TrustedFriendsModalHost,
  type TrustedFriendsUserNames,
} from "./trustedFriendsModalHost";

const userNameFields = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];

const DotnetAvatarHeadshot = ({
  userId,
  className,
}: {
  userId: number;
  className: string;
}): React.JSX.Element => (
  // Ungated: only the friends carousel is behind the profile-frame IXP gate.
  <Thumbnail2d
    containerClass={className}
    type={ThumbnailTypes.avatarHeadshot}
    size={ThumbnailAvatarHeadshotSize.size48}
    targetId={userId}
    format={ThumbnailFormat.webp}
    includeProfileFrame
  />
);

const useDotnetUserNames = (userId: number): TrustedFriendsUserNames | undefined => {
  const { data } = useUserProfiles([userId], userNameFields);
  return data?.[userId]?.names;
};

export const dotnetTrustedFriendsModalHost: TrustedFriendsModalHost = {
  startAccessManagementUpsell: params =>
    AccessManagementUpsellV2Service.startAccessManagementUpsell(params),
  AvatarHeadshot: DotnetAvatarHeadshot,
  useUserNames: useDotnetUserNames,
};

const DotnetTrustedFriendsModal = (props: TrustedFriendsModalProps): React.JSX.Element => (
  <TrustedFriendsModalHostContext.Provider value={dotnetTrustedFriendsModalHost}>
    <TrustedFriendsModal {...props} />
  </TrustedFriendsModalHostContext.Provider>
);

export default DotnetTrustedFriendsModal;
