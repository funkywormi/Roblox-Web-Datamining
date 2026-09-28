import { useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { Action } from "@rbx/profile-platform";

export type TrustedFriendsOnWebEnabledResponse = {
  acceptTrustedFriendRequestOnWeb: boolean;
  sendTrustedFriendRequestOnWeb: boolean;
};

const disabledResponse: TrustedFriendsOnWebEnabledResponse = {
  acceptTrustedFriendRequestOnWeb: false,
  sendTrustedFriendRequestOnWeb: false,
};

// The backend can place trusted friend actions in either the button row or the contextual menu, so
// every surface that renders an action must consult this before rendering its button or menu item.
export const isTrustedFriendActionHidden = (
  action: Action,
  trustedFriendsOnWebEnabled: TrustedFriendsOnWebEnabledResponse,
): boolean => {
  const isAcceptTrustedFriendAction =
    action === Action.AddIncomingTrustedConnection ||
    action === Action.PendingIncomingTrustedConnection;
  const isSendTrustedFriendAction =
    action === Action.AddTrustedConnection ||
    action === Action.AddTrustedConnectionViaLink ||
    action === Action.PendingTrustedConnection;
  return (
    (isAcceptTrustedFriendAction && !trustedFriendsOnWebEnabled.acceptTrustedFriendRequestOnWeb) ||
    (isSendTrustedFriendAction && !trustedFriendsOnWebEnabled.sendTrustedFriendRequestOnWeb)
  );
};

const trustedFriendsOnWebQuery = {
  queryKey: ["web-trusted-friends"],
  queryFn: async () => {
    const result = await callBehaviour<TrustedFriendsOnWebEnabledResponse>("web-trusted-friends");
    return result;
  },
  placeholderData: disabledResponse,
};

const useIsTrustedFriendsOnWebEnabled = (): TrustedFriendsOnWebEnabledResponse => {
  const { data } = useQuery(trustedFriendsOnWebQuery);
  return data ?? disabledResponse;
};

/**
 * Whether the trusted friends rollout check has settled (succeeded or failed). Until then,
 * trusted friend actions are hidden, so surfaces rendering actions can wait on this to avoid
 * buttons popping in.
 */
export const useIsTrustedFriendsOnWebLoaded = (): boolean => {
  const { isPlaceholderData } = useQuery(trustedFriendsOnWebQuery);
  return !isPlaceholderData;
};

export default useIsTrustedFriendsOnWebEnabled;
