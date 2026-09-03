import { useMemo } from "react";
import { Action } from "@rbx/profile-platform";
import { useTranslation } from "@rbx/core-scripts/react";
import useReport from "./useReport";
import useUnfollow from "./useUnfollow";
import useUnfriend from "./useUnfriend";
import useBlock from "./useBlock";
import useFollow from "./useFollow";
import useImpersonateUser from "./useImpersonateUser";
import useAcceptFriendRequest from "./useAcceptFriendRequest";
import useAddFriend from "./useAddFriend";
import useChat from "./useChat";
import useEditAlias from "./useEditAlias";
import useJoinExperience from "./useJoinExperience";
import usePendingFriendRequest from "./usePendingFriendRequest";
import useUnblock from "./useUnblock";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHandler } from "../../types/actionHookTypes";
import useRemoveTrustedConnectionRequest from "./useRemoveTrustedConnectionRequest";
import useTrustedConnectionModal from "./useTrustedConnectionModal";
import useCurrencyTransfer from "./useCurrencyTransfer";

type ActionMapEntryBase = {
  text: string;
  variant?: "Emphasis" | "Standard";
  Component?: () => React.ReactNode;
  willPopoverOpen?: () => void;
  isLoading?: boolean;
};
type ActionMapEntryDisabled = ActionMapEntryBase & {
  disabled: boolean;
  handler?: never;
  href?: never;
};
type ActionMapEntryWithHandler = ActionMapEntryBase & {
  handler: ActionHandler;
  href?: never;
  disabled?: never;
};
type ActionMapEntryWithHref = ActionMapEntryBase & {
  href: string;
  handler?: never;
  disabled?: never;
};
export type ActionMapEntry =
  | ActionMapEntryDisabled
  | ActionMapEntryWithHandler
  | ActionMapEntryWithHref;
export type ActionMapReturnType = Partial<Record<Action, ActionMapEntry>>;

export const useActionMap = (): ActionMapReturnType => {
  const { translate } = useTranslation();
  const { profileId } = useProfilePlatformContext();
  const {
    handler: handleReport,
    Component: ReportComponent,
    willPopoverOpen: willReportPopoverOpen,
  } = useReport();
  const { handler: handleAcceptFriendRequest, isLoading: isAcceptFriendRequestLoading } =
    useAcceptFriendRequest();
  const { handler: handleAddFriend, isLoading: isAddFriendLoading } = useAddFriend();
  const { handler: handleBlock, Component: BlockComponent, isLoading: isBlockLoading } = useBlock();
  const { handler: handleChat } = useChat();
  const { handler: handleEditAlias, Component: EditAliasComponent } = useEditAlias();
  const { handler: handleFollow, isLoading: isFollowLoading } = useFollow();
  const { handler: handleImpersonateUser, isLoading: isImpersonateUserLoading } =
    useImpersonateUser();
  const { handler: handleJoinExperience } = useJoinExperience();
  const { handler: handlePendingFriendRequest } = usePendingFriendRequest();
  const {
    handler: handleUnblock,
    Component: UnblockComponent,
    isLoading: isUnblockLoading,
  } = useUnblock();
  const { handler: handleUnfollow, isLoading: isUnfollowLoading } = useUnfollow();
  const { handler: handleUnfriend, isLoading: isUnfriendLoading } = useUnfriend();
  const {
    handler: handleRemoveTrustedFriendRequest,
    isLoading: isRemoveTrustedFriendRequestLoading,
  } = useRemoveTrustedConnectionRequest();
  const {
    handler: handleAcceptTrustedConnectionRequest,
    Component: AcceptTrustedConnectionComponent,
  } = useTrustedConnectionModal();
  const { handler: handleAddTrustedConnectionRequest, Component: AddTrustedConnectionComponent } =
    useTrustedConnectionModal();
  const {
    handler: handleAddTrustedConnectionViaLink,
    Component: AddTrustedConnectionViaLinkComponent,
  } = useTrustedConnectionModal();
  const { handler: handleCurrencyTransfer } = useCurrencyTransfer();

  return useMemo(
    () => ({
      [Action.AcceptFriendRequest]: {
        text: translate("Action.Accept"),
        handler: handleAcceptFriendRequest,
        isLoading: isAcceptFriendRequestLoading,
      },
      [Action.AddFriend]: {
        text: translate("Label.AddFriend"),
        handler: handleAddFriend,
        isLoading: isAddFriendLoading,
      },
      [Action.Block]: {
        text: translate("Action.BlockUser"),
        handler: handleBlock,
        Component: BlockComponent,
        isLoading: isBlockLoading,
      },
      [Action.Chat]: {
        text: translate("Action.Chat"),
        handler: handleChat,
        variant: "Standard",
      },
      [Action.EditAlias]: {
        text: translate("Label.CustomizeName"),
        handler: handleEditAlias,
        Component: EditAliasComponent,
      },
      [Action.EditAvatar]: {
        text: translate("Action.EditAvatar"),
        href: "/my/avatar",
      },
      [Action.EditProfile]: {
        text: translate("Action.EditProfile"),
        href: "/users/profile/edit",
      },
      [Action.Follow]: {
        text: translate("Action.Follow"),
        handler: handleFollow,
        isLoading: isFollowLoading,
      },
      [Action.ImpersonateUser]: {
        text: translate("Action.ImpersonateUser"),
        handler: handleImpersonateUser,
        isLoading: isImpersonateUserLoading,
      },
      [Action.JoinExperience]: {
        text: translate("Action.JoinGame"),
        handler: handleJoinExperience,
      },
      [Action.PendingFriendRequest]: {
        text: translate("Action.Pending"),
        handler: handlePendingFriendRequest,
      },
      [Action.Report]: {
        text: translate("Action.ReportAbuse"),
        handler: handleReport,
        Component: ReportComponent,
        willPopoverOpen: willReportPopoverOpen,
      },
      [Action.TradeItems]: {
        text: translate("Action.TradeItems"),
        href: `/users/${profileId}/trade`,
      },
      [Action.Unblock]: {
        text: translate("Action.Unblock"),
        handler: handleUnblock,
        Component: UnblockComponent,
        isLoading: isUnblockLoading,
      },
      [Action.Unfollow]: {
        text: translate("Action.Unfollow"),
        handler: handleUnfollow,
        isLoading: isUnfollowLoading,
      },
      [Action.Unfriend]: {
        text: translate("Label.RemoveFriend"),
        handler: handleUnfriend,
        isLoading: isUnfriendLoading,
      },
      [Action.ViewFavorites]: {
        text: translate("Action.Favorites"),
        href: `/users/${profileId}/favorites`,
      },
      [Action.ViewInventory]: {
        text: translate("Action.Inventory"),
        href: `/users/${profileId}/inventory`,
      },
      [Action.AddIncomingTrustedConnection]: {
        text: translate("TrustedFriend.AcceptTrustedRequest"),
        handler: handleAcceptTrustedConnectionRequest,
        Component: AcceptTrustedConnectionComponent,
      },
      [Action.PendingIncomingTrustedConnection]: {
        text: translate("TrustedFriend.AcceptTrustedRequest"),
        disabled: true,
      },
      [Action.AddTrustedConnection]: {
        text: translate("TrustedFriend.Label.AddTrustedFriend"),
        handler: handleAddTrustedConnectionRequest,
        Component: AddTrustedConnectionComponent,
      },
      [Action.AddTrustedConnectionViaLink]: {
        text: translate("TrustedFriend.Label.AddTrustedFriend"),
        handler: handleAddTrustedConnectionViaLink,
        Component: AddTrustedConnectionViaLinkComponent,
      },
      [Action.PendingTrustedConnection]: {
        text: translate("TrustedFriend.Label.AddTrustedFriend"),
        disabled: true,
      },
      [Action.RemoveTrustedConnection]: {
        text: translate("TrustedFriend.Action.RemoveTrustedFriend"),
        handler: handleRemoveTrustedFriendRequest,
        isLoading: isRemoveTrustedFriendRequestLoading,
      },
      [Action.CurrencyTransfer]: {
        text: translate("Action.SendRobux"),
        handler: handleCurrencyTransfer,
      },
    }),
    [
      translate,
      profileId,
      handleAcceptFriendRequest,
      isAcceptFriendRequestLoading,
      handleAddFriend,
      isAddFriendLoading,
      handleBlock,
      BlockComponent,
      isBlockLoading,
      handleChat,
      handleEditAlias,
      EditAliasComponent,
      handleFollow,
      isFollowLoading,
      handleImpersonateUser,
      isImpersonateUserLoading,
      handleJoinExperience,
      handlePendingFriendRequest,
      handleReport,
      ReportComponent,
      willReportPopoverOpen,
      handleUnblock,
      UnblockComponent,
      isUnblockLoading,
      handleUnfollow,
      isUnfollowLoading,
      handleUnfriend,
      isUnfriendLoading,
      handleRemoveTrustedFriendRequest,
      isRemoveTrustedFriendRequestLoading,
      handleAcceptTrustedConnectionRequest,
      AcceptTrustedConnectionComponent,
      handleAddTrustedConnectionRequest,
      AddTrustedConnectionComponent,
      handleAddTrustedConnectionViaLink,
      AddTrustedConnectionViaLinkComponent,
      handleCurrencyTransfer,
    ],
  );
};
