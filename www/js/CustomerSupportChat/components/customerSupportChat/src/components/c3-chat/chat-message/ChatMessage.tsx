import React from "react";
import Markdown from "markdown-to-jsx";
import classNames from "classnames";

import ChatParticipantIcon from "../chat-participant-icon/ChatParticipantIcon";
import "./ChatMessage.scss";

interface Props {
  id: string;
  isUser: boolean;
  isFirstMessageInGroup: boolean;
  isLastMessageinGroup: boolean;
  content?: string;
  isProcessingMessage?: boolean;
  removeParticipantLogo?: boolean;
}

const getCssClasses = (
  isUser: boolean,
  isFirstMessageInGroup: boolean,
  isLastMessageinGroup: boolean,
): string => {
  return classNames("c3-chat-message", {
    "first-in-group": isFirstMessageInGroup && !isLastMessageinGroup,
    "last-in-group": isLastMessageinGroup && !isFirstMessageInGroup,
    "single-message": isFirstMessageInGroup && isLastMessageinGroup,
    "is-user": isUser,
    "is-agent": !isUser,
  });
};

const NewTabLink = ({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>): React.ReactElement => (
  <a {...props} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const MARKDOWN_OPTIONS = {
  wrapper: React.Fragment,
  overrides: { a: { component: NewTabLink } },
};

/** Renders a chat message's markdown, opening links in a new tab. */
export const ChatMarkdown = ({ content }: { content: string }): React.ReactElement => (
  <Markdown options={MARKDOWN_OPTIONS}>{content}</Markdown>
);

const ChatMessage = ({
  id,
  isUser,
  isFirstMessageInGroup,
  isLastMessageinGroup,
  isProcessingMessage,
  content,
  removeParticipantLogo = false,
}: Props): React.ReactElement => {
  return (
    <div className={`c3-chat-message-container ${isUser ? "is-user" : "is-agent"}`}>
      {!removeParticipantLogo && (
        <ChatParticipantIcon isUser={isUser} showIcon={isLastMessageinGroup} />
      )}
      <span
        data-testid={`c3-chat-message-${id}`}
        className={getCssClasses(isUser, isFirstMessageInGroup, isLastMessageinGroup)}
      >
        {isProcessingMessage ? (
          <span className="c3-chat-message-agent-processing">
            <span className="spinner spinner-default" data-testid="c3-chat-processing-icon" />
          </span>
        ) : (
          content && (
            <div className="c3-chat-message-markdown-styling">
              <ChatMarkdown content={content} />
            </div>
          )
        )}
      </span>
    </div>
  );
};

export default ChatMessage;
