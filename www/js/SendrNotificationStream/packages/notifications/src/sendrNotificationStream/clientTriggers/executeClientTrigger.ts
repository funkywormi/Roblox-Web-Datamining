import { CLIENT_TRIGGER_PATHS } from "../constants/clientTriggerConstants";
import { requestTrustedFriendsAcceptModal } from "./clientTriggerModalBridge";

export type ClientTriggerPayload = {
  senderId?: string;
  linkTokens?: number[];
};

export function executeClientTrigger(
  path: string,
  payload: ClientTriggerPayload,
): Promise<boolean> {
  switch (path) {
    case CLIENT_TRIGGER_PATHS.TrustedFriendsAcceptModal: {
      if (!payload.senderId) {
        return Promise.resolve(false);
      }
      const options: { userId: number; linkTokens?: number[] } = {
        userId: Number(payload.senderId),
      };
      if (payload.linkTokens !== undefined) {
        options.linkTokens = payload.linkTokens;
      }
      return requestTrustedFriendsAcceptModal(options);
    }
    default: {
      return Promise.resolve(false);
    }
  }
}
