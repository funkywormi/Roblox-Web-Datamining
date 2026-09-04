import { startDesktopAndMobileWebChat } from "@rbx/core-scripts/util/chat";

export const startChat = (friendId: number): void => {
  startDesktopAndMobileWebChat({ userId: friendId });
};
