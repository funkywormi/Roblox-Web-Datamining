import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { askQuestion } from "../core/services/supportAskService";
import parseAskPayload from "../core/helpers/supportAskHelpers";
import { C3ChatMessageType, C3ChatMetadataPayload } from "../core/types/c3Chat";
import { AskPayload } from "../core/types/supportAsk";
import { useGetChatMessage } from "./c3ChatServices";

/**
 * Upper bound on the wait for an answer. The conversation can end without ever producing a
 * reply -- an unregistered namespace, a dropped queue message -- and polling has no other way
 * to learn that, so it has to give up on a clock.
 */
const ANSWER_TIMEOUT_MS = 60_000;

const CREATE_FAILED_MESSAGE = "Something went wrong, please try again later.";
const TIMEOUT_MESSAGE = "This took too long to answer. Please try again.";

export type SupportAskState = {
  /** Non-null once a question has been asked, which swaps the page to the answer view. */
  submittedQuestion: string | null;
  /** Markdown to display. Absent until the answer arrives. */
  reply: string | null;
  /**
   * The same answer as data, for rendering the portal button and article list. Absent for
   * replies produced outside the ask graph (safety, error boundary), where `reply` is all
   * there is.
   */
  payload: AskPayload | null;
  /** The ask conversation, which "Start a chat" hands to the subsite to continue in Sierra. */
  chatMetadata: C3ChatMetadataPayload | null;
  isWaiting: boolean;
  error: string | null;
  ask: (question: string) => void;
  reset: () => void;
};

/**
 * Runs one ask turn: create a conversation through the subsite, then poll chatbot-api until the
 * bot replies.
 *
 * Ask is single-shot -- the runner always ends the turn -- so the first non-user interaction is
 * the entire answer and polling stops there. That is the whole difference from `useC3Chat`,
 * which keeps a multi-turn transcript.
 */
const useSupportAsk = (): SupportAskState => {
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  const [chatMetadata, setChatMetadata] = useState<C3ChatMetadataPayload | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [payload, setPayload] = useState<AskPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Bumped by every ask and reset, so a create response that lands after Back or a newer ask
  // is dropped instead of attaching its conversation to whatever is on screen now.
  const currentAskIdRef = useRef(0);

  const { mutate: createConversation } = useMutation({
    mutationFn: ({ question }: { question: string; askId: number }) => askQuestion({ question }),
    onSuccess: (response, { askId }) => {
      if (askId !== currentAskIdRef.current) {
        return;
      }
      // The employee check and the kill switch both report here rather than by status code.
      if (!response.success || !response.chatMetadata) {
        setError(response.message || CREATE_FAILED_MESSAGE);
        return;
      }
      setChatMetadata(response.chatMetadata);
    },
    onError: (requestError: unknown, { askId }) => {
      if (askId !== currentAskIdRef.current) {
        return;
      }
      console.error("[SupportAsk] failed to create conversation", requestError);
      setError(CREATE_FAILED_MESSAGE);
    },
  });

  // Only poll between the conversation existing and the turn resolving.
  const isPolling = chatMetadata !== null && reply === null && error === null;

  const { data: interactions } = useGetChatMessage(
    chatMetadata?.conversationId ?? "",
    chatMetadata?.conversationAuthToken ?? "",
    // Ask past the question itself, which the endpoint already echoed back to us.
    chatMetadata?.firstUserInteraction.ordinal ?? 0,
    isPolling,
    isPolling,
  );

  const answer = interactions?.find(
    interaction => interaction.type !== C3ChatMessageType.EndConversation,
  );

  useEffect(
    () => {
      if (!answer) {
        return;
      }
      // The ask graph sends its payload in place of the message; anything else -- safety
      // and error-boundary replies -- is markdown, and the contract marker tells them apart.
      const parsed = parseAskPayload(answer.message);
      if (parsed.status === "unrenderable") {
        // The message is JSON, so there is nothing to show the user but the generic error.
        console.error("[SupportAsk] answer is marked as a payload but carries no prose");
        setError(CREATE_FAILED_MESSAGE);
        return;
      }
      setPayload(parsed.status === "payload" ? parsed.payload : null);
      setReply(parsed.status === "payload" ? parsed.payload.message : answer.message);
    },
    // Keyed on the id, not the array: react-query hands back a stable reference across
    // unchanged polls, so identity alone would not say whether this is a new interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answer?.id],
  );

  useEffect(() => {
    if (!isPolling) {
      return undefined;
    }
    const timeoutId = setTimeout(() => {
      setError(TIMEOUT_MESSAGE);
    }, ANSWER_TIMEOUT_MS);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPolling]);

  const ask = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) {
        return;
      }
      setSubmittedQuestion(trimmed);
      setChatMetadata(null);
      setReply(null);
      setPayload(null);
      setError(null);
      currentAskIdRef.current += 1;
      createConversation({ question: trimmed, askId: currentAskIdRef.current });
    },
    [createConversation],
  );

  const reset = useCallback(() => {
    currentAskIdRef.current += 1;
    setSubmittedQuestion(null);
    setChatMetadata(null);
    setReply(null);
    setPayload(null);
    setError(null);
  }, []);

  return {
    submittedQuestion,
    reply,
    payload,
    chatMetadata,
    isWaiting: submittedQuestion !== null && reply === null && error === null,
    error,
    ask,
    reset,
  };
};

export default useSupportAsk;
