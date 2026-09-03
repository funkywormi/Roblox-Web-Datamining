import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";
import ChatMessageList from "./chat-message-list/ChatMessageList";
import SupportPageContainer from "../common/support-page-container/SupportPageContainer";

import useNav from "../../hooks/useNav";
import { SupportContext } from "../../providers/SupportContextProvider";
import { C3ChatMetadataPayload } from "../../core/types/c3Chat";
import useChat from "../../hooks/useC3Chat";
import ChatInput from "./chat-input/ChatInput";
import "./Chat.scss";
import useGetC3ChatConfigPayload from "../../hooks/useGetC3ChatConfigPayload";

const isValidChatConfig = (config?: C3ChatMetadataPayload): boolean => {
  return Boolean(
    config &&
      Object.keys(config).length > 0 &&
      Object.values(config).every(value => value !== undefined && value !== null),
  );
};

type ChatProps = {
  c3ChatConfig: C3ChatMetadataPayload;
  removeRbxLogo?: boolean;
};

/**
 * Chat component that renders the C3 (customer care chat) bot
 * @param c3ChatConfig - The configuration for the chat
 * @param removeRbxLogo - Optional flag to remove the Roblox logo for the agent chat messages
 */
const Chat: React.FC<ChatProps> = ({ c3ChatConfig: chatConfig, removeRbxLogo }) => {
  const { translate: t } = useTranslation();

  const { messages, handleSendMessage, isChatEnded, waitingForResponse } = useChat(chatConfig);
  const headerText = isChatEnded ? t("Chat.Description.ThankYou") : t("Chat.Header.CTATitle");
  return (
    <SupportPageContainer>
      <div className="c3-chat-container">
        <h3 className="c3-chat-header">{headerText}</h3>
        <div className="c3-chat-body">
          <ChatMessageList
            c3Messages={messages}
            isProccessingResponse={waitingForResponse}
            removeRbxLogo={removeRbxLogo}
          />
          {isChatEnded ? (
            <div className="c3-chat-ended-message-container">
              {t("Chat.Description.ConversationEnded")}
            </div>
          ) : (
            <ChatInput disabled={waitingForResponse} sendMessage={handleSendMessage} />
          )}
        </div>
      </div>
    </SupportPageContainer>
  );
};

const ChatWithRedirect = (): JSX.Element | null => {
  const { pushToParent } = useNav();
  const { c3ChatConfig } = useContext(SupportContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chatConfigId = (queryParams.get("chatConfigId") || "").trim();
  const {
    data: chatConfigData,
    isError: isChatConfigError,
    isLoading: isChatConfigLoading,
  } = useGetC3ChatConfigPayload(chatConfigId);

  // first check if we have a chatConfigId from the query params
  // if we do, we will try to fetch the chat config for that chatConfigId
  if (chatConfigId) {
    if (isChatConfigLoading) {
      return (
        <SupportPageContainer>
          <span className="spinner spinner-default" />
        </SupportPageContainer>
      );
    }
    if (isChatConfigError || !isValidChatConfig(chatConfigData)) {
      pushToParent();
      return null;
    }

    // we want to hide the Roblox logo if we are reaching the chat from a chatConfigId
    return <Chat c3ChatConfig={chatConfigData!} removeRbxLogo />;
  }

  // if we don't have a conversationId, we will use the c3ChatConfig from the context
  if (!isValidChatConfig(c3ChatConfig)) {
    pushToParent();
    return null;
  }

  return <Chat c3ChatConfig={c3ChatConfig!} />;
};

export default ChatWithRedirect;
