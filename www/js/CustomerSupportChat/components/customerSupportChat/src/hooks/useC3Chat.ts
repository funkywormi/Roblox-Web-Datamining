import { useCallback, useEffect, useRef, useState } from "react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";
import {
  C3ChatMessage,
  C3ChatMessageType,
  C3ChatMetadataPayload,
  C3Interaction,
} from "../core/types/c3Chat";
import { useGetChatMessage, usePostChatMessage } from "./c3ChatServices";

// timeout after which we consider the chatbot response as timed out
const TIMEOUT_DURATION = 10 * 60_000;

// custom hook to handle the chat timeout
const useChatTimeout = (onTimeout: () => void) => {
  const timeoutIdRef = useRef<number | undefined>(undefined);

  // we assume we'll always want to call the latest `onTimeout` function given
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  // keep resetChatTimeout identity
  const resetChatTimeout = useCallback(() => {
    clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(() =>
      // get a reference at the point we make the timeout call
      {
        onTimeoutRef.current();
      }, TIMEOUT_DURATION) as unknown as number;
  }, []);

  // at the beginning, we're waiting for a response
  // so we need to start a timer
  useEffect(() => {
    resetChatTimeout();
    return () => {
      clearTimeout(timeoutIdRef.current);
    };
  }, [resetChatTimeout]);

  return {
    resetChatTimeout,
    clearChatTimeout: () => {
      clearTimeout(timeoutIdRef.current);
    },
  };
};

const useChat = (
  chatConfig: C3ChatMetadataPayload,
): {
  messages: C3ChatMessage[];
  handleSendMessage: (message: string) => void;
  isChatEnded: boolean;
  waitingForResponse: boolean;
} => {
  const [messages, setMessages] = useState(() => {
    const firstMessage: C3ChatMessage = {
      ...chatConfig.firstUserInteraction,
      id: uuidService.generateRandomUuid(),
      isUser: true,
    };
    return [firstMessage];
  });
  // we are waiting for a response from the chatbot at the begginning
  const [waitingForResponse, setWaitingForResponse] = useState(true);
  const [lastMessageOrdinal, setLastMessageOrdinal] = useState(0);
  const [isChatEnded, setChatEnded] = useState(false);
  const { resetChatTimeout, clearChatTimeout } = useChatTimeout(() => {
    setWaitingForResponse(false);
  });
  const { translate } = useTranslation();

  const { data: c3GetMessageResponse, failureCount: failureCountGetMessage } = useGetChatMessage(
    chatConfig.conversationId,
    chatConfig.conversationAuthToken,
    lastMessageOrdinal,
    waitingForResponse,
    !isChatEnded,
  );
  const { postChatMessage, failureCount: failureCountPostMessage } = usePostChatMessage(
    chatConfig.conversationId,
    chatConfig.conversationAuthToken,
  );

  // we want to trigger the useEffect only when we get new messages
  const lastMessageId = c3GetMessageResponse?.length
    ? c3GetMessageResponse[c3GetMessageResponse.length - 1]!.id
    : "";

  useEffect(
    () => {
      // we just received new messages
      if (c3GetMessageResponse?.length) {
        clearChatTimeout();
        const newMessages = c3GetMessageResponse
          .filter(message => message.type !== C3ChatMessageType.EndConversation)
          .map(
            message =>
              ({
                ...message,
                Id: message.id,
                Message: message.message,
                Type: message.type,
                Ordinal: message.ordinal,
                isUser: false,
              }) as C3ChatMessage,
          );
        setMessages(prevMessages => [...prevMessages, ...newMessages]);
        setWaitingForResponse(false);
        setLastMessageOrdinal(c3GetMessageResponse[c3GetMessageResponse.length - 1]!.ordinal);
        // conversation ended
        if (
          c3GetMessageResponse.some(message => message.type === C3ChatMessageType.EndConversation)
        ) {
          setChatEnded(true);
        }
      }

      return () => {
        clearChatTimeout();
      };
      // this useEffect should run when we receive new messages
    },
    // TODO: fix me
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastMessageId],
  );

  const handleSendMessage = (message: string, ordinal: number) => {
    const newC3Interaction: C3Interaction = {
      message,
      ordinal,
      id: uuidService.generateRandomUuid(),
      type: C3ChatMessageType.Message,
    };
    const newMessage: C3ChatMessage = {
      ...newC3Interaction,
      isUser: true,
    };
    postChatMessage(newC3Interaction);
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setWaitingForResponse(true);
    resetChatTimeout();
  };

  // there might be errors, but we're still retrying get the messages, so we don't want to show the error message
  // until the timeout is reached which sets waiutingForResponse to false
  const showErrorMessage =
    (failureCountGetMessage || failureCountPostMessage) && !waitingForResponse;

  // show an error message if we have a new error: when showErrorMessage changes from `false` to `true`
  useEffect(
    () => {
      if (showErrorMessage) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: uuidService.generateRandomUuid(),
            message: translate("Chat.Description.ErrorMessage"),
            type: C3ChatMessageType.Message,
            ordinal: lastMessageOrdinal + 1,
            isUser: false,
          },
        ]);
      }
    },
    // TODO: fix me
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showErrorMessage],
  );

  return {
    messages,
    handleSendMessage: message => {
      handleSendMessage(message, lastMessageOrdinal);
    },
    isChatEnded,
    waitingForResponse,
  };
};

export default useChat;
