import React, { useEffect, useRef, useState } from "react";
import { C3ChatMessage } from "../../../core/types/c3Chat";
import ChatMessage from "../chat-message/ChatMessage";
import { chatTimestamp } from "../../../core/helpers/c3ChatHelpers";
import "./ChatMessageList.scss";

const ChatTimestamp = () => {
  const [timestamp] = useState(() => chatTimestamp());
  return <span className="c3-chat-timestamp">{timestamp}</span>;
};

type ChatMessageListProps = {
  c3Messages: C3ChatMessage[];
  isProccessingResponse?: boolean;
  removeRbxLogo?: boolean;
};

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  c3Messages,
  isProccessingResponse,
  removeRbxLogo,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [c3Messages]); // Depend on messages to scroll on update

  return (
    <div className="c3-chat-messages-container">
      <div className="c3-chat-messages-content" ref={scrollRef}>
        <ChatTimestamp />
        {c3Messages.map((c3Message, index) => {
          const isFirstMessageInGroup =
            index === 0 || c3Message.isUser !== c3Messages[index - 1]?.isUser;

          const isLastMessageinGroup =
            index === c3Messages.length - 1 || c3Message.isUser !== c3Messages[index + 1]?.isUser;

          return (
            <ChatMessage
              id={c3Message.id}
              key={c3Message.id}
              isUser={c3Message.isUser}
              content={c3Message.message}
              isLastMessageinGroup={isLastMessageinGroup}
              isFirstMessageInGroup={isFirstMessageInGroup}
              removeParticipantLogo={!c3Message.isUser && removeRbxLogo} // Hide logo for agent messages if specified
            />
          );
        })}
        {isProccessingResponse && (
          <ChatMessage
            id="processing"
            isUser={false}
            isFirstMessageInGroup
            isLastMessageinGroup
            isProcessingMessage
            removeParticipantLogo={removeRbxLogo}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessageList;
