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
              <Markdown
                options={{
                  wrapper: React.Fragment,
                  overrides: {
                    a: {
                      // We want to open links in a new tab
                      component: ({ children, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    },
                  },
                }}
              >
                {content}
              </Markdown>
            </div>
          )
        )}
      </span>
    </div>
  );
};

export default ChatMessage;
