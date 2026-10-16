import { useCallback, useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { startAskChat } from "../core/services/supportAskService";
import { clearSierraChatSession } from "../core/helpers/sierraSessionStorageManager";
import {
  resolveAskChatCategory,
  resolveAskChatDevice,
} from "../core/helpers/supportAskChatHelpers";
import { AppRoute, SupportContextKey } from "../core/types/common";
import { C3ChatMetadataPayload } from "../core/types/c3Chat";
import { AskSupportCategory } from "../core/types/supportAsk";
import { SupportTicketStateKey } from "../core/types/supportTicket";
import { SupportContext } from "../providers/SupportContextProvider";
import useNav from "./useNav";

const START_FAILED_MESSAGE = "Something went wrong, please try again later.";

export type StartAskChatState = {
  startChat: (
    chatMetadata: C3ChatMetadataPayload,
    question: string,
    supportCategory: AskSupportCategory | null,
  ) => void;
  isStarting: boolean;
  error: string | null;
  reset: () => void;
};

/**
 * Continues an answered question in a Sierra chat under the same conversation id.
 *
 * Fills the context the Sierra route reads the way a support-form submission would.
 */
const useStartAskChat = (): StartAskChatState => {
  const { updateSupportInquiryContext, metadata } = useContext(SupportContext);
  const { pushSegment } = useNav();
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      chatMetadata,
    }: {
      chatMetadata: C3ChatMetadataPayload;
      question: string;
      supportCategory: AskSupportCategory | null;
    }) =>
      startAskChat({
        conversationId: chatMetadata.conversationId,
        conversationAuthToken: chatMetadata.conversationAuthToken,
      }),
    onSuccess: (response, { question, supportCategory }) => {
      if (!response.success || !response.conversationId) {
        setError(response.message || START_FAILED_MESSAGE);
        return;
      }
      const { category, subcategory } = resolveAskChatCategory(supportCategory, metadata);
      updateSupportInquiryContext({
        [SupportContextKey.ConversationId]: response.conversationId,
        [SupportContextKey.UserTouRegion]: response.userTouRegion ?? "",
        [SupportContextKey.TopicClassification]: "",
        [SupportContextKey.SubmittedSupportFormData]: {
          [SupportTicketStateKey.Username]: response.username ?? "",
          [SupportTicketStateKey.Email]: response.contactEmail ?? "",
          [SupportTicketStateKey.Message]: question,
          [SupportTicketStateKey.HelpCategoryType]: category,
          [SupportTicketStateKey.HelpSubCategoryType]: subcategory,
          [SupportTicketStateKey.DeviceType]: resolveAskChatDevice(metadata),
        },
      });
      clearSierraChatSession();
      pushSegment(AppRoute.SupportChatSierra);
    },
    onError: (requestError: unknown) => {
      console.error("[SupportAsk] failed to start chat", requestError);
      setError(START_FAILED_MESSAGE);
    },
  });

  const startChat = useCallback(
    (
      chatMetadata: C3ChatMetadataPayload,
      question: string,
      supportCategory: AskSupportCategory | null,
    ) => {
      setError(null);
      mutate({ chatMetadata, question, supportCategory });
    },
    [mutate],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { startChat, isStarting: isPending, error, reset };
};

export default useStartAskChat;
