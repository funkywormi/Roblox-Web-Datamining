import * as http from "@rbx/core-scripts/http";
import { apiSet } from "../constants/services";
import {
  SupportAskChatRequest,
  SupportAskChatResponse,
  SupportAskRequest,
  SupportAskResponse,
} from "../types/supportAsk";

/**
 * Creates a conversation for one question. Returns the metadata needed to poll chatbot-api for
 * the answer; it does not carry the answer itself.
 */
export const askQuestion = async (params: SupportAskRequest): Promise<SupportAskResponse> => {
  const { data } = await http.post<SupportAskResponse>(apiSet.askQuestion, params);
  return data;
};

/** Checks chat eligibility for an answered question and returns what Sierra needs to start. */
export const startAskChat = async (
  params: SupportAskChatRequest,
): Promise<SupportAskChatResponse> => {
  const { data } = await http.post<SupportAskChatResponse>(apiSet.startAskChat, params);
  return data;
};

export default askQuestion;
