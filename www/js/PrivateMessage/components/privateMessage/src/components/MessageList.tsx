import { MESSAGE_TABS } from "../constants";
import type {
  FormatDate,
  MessageItem,
  MessagePage,
  MessageTab,
  RenderThumbnail,
  Translate,
} from "../types";
import MessageRow from "./MessageRow";

const emptyMessageKeyByTab: Record<MessageTab, string> = {
  [MESSAGE_TABS.inbox]: "Label.NoMessagesInInbox",
  [MESSAGE_TABS.sent]: "Label.NoSentMessages",
  [MESSAGE_TABS.notifications]: "Message.NoNews",
  [MESSAGE_TABS.archive]: "Label.NoMessagesInArchive",
};

const MessageList = ({
  translate,
  renderThumbnail,
  formatListDate,
  page,
  activeTab,
  selectedMessageIds,
  onToggleSelection,
  onOpenMessage,
}: {
  translate: Translate;
  renderThumbnail: RenderThumbnail;
  formatListDate: FormatDate;
  page: MessagePage | null;
  activeTab: MessageTab;
  selectedMessageIds: Set<number>;
  onToggleSelection: (messageId: number) => void;
  onOpenMessage: (message: MessageItem, index: number) => void;
}): React.ReactElement => {
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
          translate={translate}
          renderThumbnail={renderThumbnail}
          formatListDate={formatListDate}
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
