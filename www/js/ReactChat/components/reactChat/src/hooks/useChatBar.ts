import { useMemo, useState } from "react";
import type { TChatConversation } from "../types/chat";

export type TUseChatBarResult = {
  conversations: TChatConversation[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  unreadConversationCount: number;
};

export const useChatBar = (
  sourceConversations: TChatConversation[],
  unreadConversationCount: number,
): TUseChatBarResult => {
  const [searchTerm, setSearchTerm] = useState("");

  const conversations = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    if (!normalizedSearchTerm) {
      return sourceConversations;
    }

    return sourceConversations.filter(conversation =>
      [conversation.title, conversation.preview].some(value =>
        value.toLowerCase().includes(normalizedSearchTerm),
      ),
    );
  }, [searchTerm, sourceConversations]);

  return {
    conversations,
    searchTerm,
    setSearchTerm,
    unreadConversationCount,
  };
};
