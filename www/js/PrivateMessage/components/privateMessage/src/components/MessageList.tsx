import { useTranslation } from "@rbx/core-scripts/react";
import { MESSAGE_TABS } from "../constants";
import type { MessageItem, MessagePage, MessageTab } from "../types";
import MessageRow from "./MessageRow";

const emptyMessageKeyByTab: Record<MessageTab, string> = {
  [MESSAGE_TABS.inbox]: "Label.NoMessagesInInbox",
  [MESSAGE_TABS.sent]: "Label.NoSentMessages",
  [MESSAGE_TABS.notifications]: "Message.NoNews",
  [MESSAGE_TABS.archive]: "Label.NoMessagesInArchive",
};

const MessageList = ({
  page,
  activeTab,
  selectedMessageIds,
  onToggleSelection,
  onOpenMessage,
}: {
  page: MessagePage | null;
  activeTab: MessageTab;
  selectedMessageIds: Set<number>;
  onToggleSelection: (messageId: number) => void;
  onOpenMessage: (message: MessageItem, index: number) => void;
}): React.ReactElement => {
  const { translate } = useTranslation();
  const messages = page?.collection ?? [];

  if (messages.length === 0) {
    return (
      <div className="bg-surface-100 stroke-standard stroke-muted radius-medium padding-large text-body-medium content-muted text-center">
        {translate(emptyMessageKeyByTab[activeTab])}
      </div>
    );
  }

  return (
    <div className="overflow-hidden radius-medium stroke-standard stroke-muted">
      {messages.map((message, index) => (
        <MessageRow
          key={message.id}
          message={message}
          index={index}
          activeTab={activeTab}
          isSelected={selectedMessageIds.has(message.id)}
          isSelectable={activeTab !== MESSAGE_TABS.sent && activeTab !== MESSAGE_TABS.notifications}
          onToggleSelection={onToggleSelection}
          onOpen={onOpenMessage}
        />
      ))}
    </div>
  );
};

export default MessageList;
