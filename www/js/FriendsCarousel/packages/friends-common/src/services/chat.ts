import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { TChatMetadataResponse, TGetChatSettings } from "../types/friendsCarousel";

export const getChatSettings = async (): Promise<TGetChatSettings> => {
  const { data } = await http.get<TChatMetadataResponse>({
    url: `${environmentUrls.chatApi}/v1/metadata`,
    withCredentials: true,
  });
  return {
    chatEnabled: data.isChatUserMessagesEnabled,
  };
};
