import { SierraSDKProps } from "../types/sierra";

export const darkModeColors = {
  background: "#393b3d",
  text: "#ffffff",
  border: "#444444",
  titleBar: "#222222",
  titleBarText: "#ffffff",
  assistantBubble: "#555555",
  assistantBubbleText: "#ffffff",
  userBubble: "#dddddd",
  userBubbleText: "#000000",
};

export const lightModeColors = {
  background: "#ffffff",
  text: "#000000",
  border: "#e0e0e0",
  titleBar: "#f0f0f0",
  titleBarText: "#000000",
  assistantBubble: "#f0f0f0",
  assistantBubbleText: "#000000",
  userBubble: "#000000",
  userBubbleText: "#ffffff",
};

export const inactivityTimeoutSeconds = 300;

export const defaultSierraSDKProps: SierraSDKProps = {
  category: "",
  subcategory: "",
  username: "",
  contactEmail: "",
  device: "",
  environment: "",
};

export const agentID = "aILDKx0Bi89bqqcBi8-TXIjveFK6wNQiYfImlMfnNss";
export const sierraSessionStorageKey = `embed-chat-${agentID}`;
export const embedProdLink = `https://sierra.chat/agent/${agentID}/embed`;
export const emebedStagingLink = `https://sierra.chat/agent/${agentID}/embed/QA`;
export const redirectToSupportFormAfterChatTerminationMs = 10000;
