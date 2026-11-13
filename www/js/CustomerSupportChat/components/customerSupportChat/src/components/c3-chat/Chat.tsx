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
import ChatFeedback from "./chat-feedback/ChatFeedback";
import SupportChatSession from "../support-chat-landing/SupportChatSession";
import SupportChatComposer from "../support-chat-landing/SupportChatComposer";
import SupportChatContent from "../support-chat-landing/SupportChatContent";
import {
  SupportChatAssistantText,
  SupportChatThinking,
  SupportChatUserText,
} from "../support-chat-landing/SupportChatText";
import { hasRequiredControl } from "../../core/helpers/c3Content";
import "./Chat.scss";
import useGetC3ChatConfigPayload from "../../hooks/useGetC3ChatConfigPayload";

/** Matches the limit of the chat's own message box. */
const MESSAGE_MAX_LENGTH = 2000;

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
  /** Continues the landing's session in place, without the full-page title or a redirect. */
  embedded?: boolean;
  /** Starts the embedded message box with text typed on the landing while the chat started. */
  initialDraft?: string;
};

/**
 * Chat component that renders the C3 (customer care chat) bot
 * @param c3ChatConfig - The configuration for the chat
 * @param removeRbxLogo - Optional flag to remove the Roblox logo for the agent chat messages
 * @param embedded - Renders in the landing column. The transcript lives in memory only.
 */
const Chat: React.FC<ChatProps> = ({
  c3ChatConfig: chatConfig,
  removeRbxLogo,
  embedded,
  initialDraft,
}) => {
  const { translate: t } = useTranslation();

  const { messages, handleSendMessage, isChatEnded, waitingForResponse } = useChat(chatConfig);

  if (embedded) {
    const latestMessage = messages.at(-1);
    // Only the newest answer's control can be used, and only while nothing else is pending.
    const answerable =
      latestMessage && !latestMessage.isUser && !waitingForResponse && !isChatEnded
        ? latestMessage
        : undefined;
    return (
      <SupportChatSession
        data-testid="c3-chat-inline"
        scrollKey={`${messages.length}-${waitingForResponse}-${isChatEnded}`}
        dock={
          isChatEnded ? (
            <p className="c3-chat-ended-message-container">
              {t("Chat.Description.ConversationEnded")}
            </p>
          ) : (
            <SupportChatComposer
              onSubmit={handleSendMessage}
              isDisabled={waitingForResponse || hasRequiredControl(answerable?.content)}
              maxLength={MESSAGE_MAX_LENGTH}
              focusOnMount
              initialDraft={initialDraft}
            />
          )
        }
      >
        {messages.map(message =>
          message.isUser ? (
            <SupportChatUserText key={message.id}>{message.message}</SupportChatUserText>
          ) : (
            <SupportChatAssistantText key={message.id}>
              <SupportChatContent
                message={message.message}
                content={message.content}
                onRespond={message === answerable ? handleSendMessage : undefined}
              />
            </SupportChatAssistantText>
          ),
        )}
        {waitingForResponse && <SupportChatThinking />}
        {isChatEnded && (
          <ChatFeedback
            conversationId={chatConfig.conversationId}
            conversationAuthToken={chatConfig.conversationAuthToken}
            removeRbxLogo
          />
        )}
      </SupportChatSession>
    );
  }

  const headerText = isChatEnded ? t("Chat.Description.ThankYou") : t("Chat.Header.CTATitle");
  const chat = (
    <React.Fragment>
      <div className="c3-chat-container">
        <h3 className="c3-chat-header">{headerText}</h3>
        <div className="c3-chat-body">
          <ChatMessageList
            c3Messages={messages}
            isProccessingResponse={waitingForResponse}
            removeRbxLogo={removeRbxLogo}
          >
            {isChatEnded && (
              <ChatFeedback
                conversationId={chatConfig.conversationId}
                conversationAuthToken={chatConfig.conversationAuthToken}
                removeRbxLogo={removeRbxLogo}
              />
            )}
          </ChatMessageList>
          {isChatEnded ? (
            <div className="c3-chat-ended-message-container">
              {t("Chat.Description.ConversationEnded")}
            </div>
          ) : (
            <ChatInput disabled={waitingForResponse} sendMessage={handleSendMessage} />
          )}
        </div>
      </div>
      <p className="c3-chat-ai-disclaimer" data-testid="c3-chat-ai-disclaimer">
        {t("Chat.Disclaimer.AIConversationMayMakeMistakes")}
      </p>
    </React.Fragment>
  );

  return <SupportPageContainer>{chat}</SupportPageContainer>;
};

export { Chat };

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
