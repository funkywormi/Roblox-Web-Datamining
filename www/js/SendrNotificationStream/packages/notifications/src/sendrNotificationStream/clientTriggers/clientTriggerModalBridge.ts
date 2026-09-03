import { CLIENT_TRIGGER_TRUSTED_FRIENDS_MODAL_EVENT } from "../constants/clientTriggerConstants";

export type TrustedFriendsAcceptModalRequestDetail = {
  userId: number;
  linkTokens?: number[];
  resolve: (isSuccess: boolean) => void;
};

export function requestTrustedFriendsAcceptModal(options: {
  userId: number;
  linkTokens?: number[];
}): Promise<boolean> {
  return new Promise(resolve => {
    window.dispatchEvent(
      new CustomEvent<TrustedFriendsAcceptModalRequestDetail>(
        CLIENT_TRIGGER_TRUSTED_FRIENDS_MODAL_EVENT,
        {
          detail: {
            userId: options.userId,
            linkTokens: options.linkTokens,
            resolve,
          },
        },
      ),
    );
  });
}
