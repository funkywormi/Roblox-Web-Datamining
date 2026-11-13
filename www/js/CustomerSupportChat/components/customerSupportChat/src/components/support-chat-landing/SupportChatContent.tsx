import React from "react";
import { Button } from "@rbx/foundation-ui";
import { ChatMarkdown } from "../c3-chat/chat-message/ChatMessage";
import { C3ContentResponse } from "../../core/types/c3Chat";
import {
  C3ContentItem,
  CONFIRM_VALUE,
  REJECT_VALUE,
  getC3ContentItems,
  helpCenterArticleUrl,
} from "../../core/helpers/c3Content";
import "./SupportChatContent.scss";

type SupportChatContentProps = {
  message: string;
  content?: readonly unknown[];
  /**
   * Answers the message's control with the label that was chosen. Left out on earlier messages,
   * whose controls stay visible so the earlier choice can still be read, but can't be used.
   */
  onRespond?: (message: string, response: C3ContentResponse) => void;
};

const Prompt = ({ text }: { text?: string }): React.ReactElement | null =>
  text ? (
    <div className="support-chat-content-prompt text-label-medium content-emphasis">
      <ChatMarkdown content={text} />
    </div>
  ) : null;

const renderItem = (
  item: C3ContentItem,
  onRespond: SupportChatContentProps["onRespond"],
): React.ReactNode => {
  const respond = (label: string, value: string) => () => {
    if (item.type === "single_select" || item.type === "confirm_reject") {
      onRespond?.(label, { id: item.id, value });
    }
  };
  switch (item.type) {
    case "markdown":
      return <ChatMarkdown content={item.text} />;
    case "tag":
      return (
        <span className="support-chat-content-tag text-caption-medium content-emphasis">
          {item.text}
        </span>
      );
    case "article_cards":
      return (
        <div className="support-chat-content-articles">
          <Prompt text={item.text} />
          <ul>
            {item.articles.map(article => (
              <li key={article.id}>
                <a
                  href={helpCenterArticleUrl(article.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    case "single_select":
      return (
        <div className="support-chat-content-control">
          <Prompt text={item.text} />
          <div className="support-chat-content-options">
            {item.options.map(option => (
              <Button
                key={option.value}
                type="button"
                variant="Utility"
                size="Small"
                isDisabled={onRespond === undefined}
                onClick={respond(option.label, option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      );
    case "confirm_reject":
      return (
        <div className="support-chat-content-control">
          <Prompt text={item.text} />
          <div className="support-chat-content-choices">
            <Button
              type="button"
              variant="Emphasis"
              size="Small"
              isDisabled={onRespond === undefined}
              onClick={respond(item.rejectLabel, REJECT_VALUE)}
            >
              {item.rejectLabel}
            </Button>
            <Button
              type="button"
              variant="Standard"
              size="Small"
              isDisabled={onRespond === undefined}
              onClick={respond(item.confirmLabel, CONFIRM_VALUE)}
            >
              {item.confirmLabel}
            </Button>
          </div>
        </div>
      );
    default:
      return null;
  }
};

/**
 * A Roblox Support answer: its content items stacked in order, or its markdown `message` when it
 * has none this client can show.
 */
const SupportChatContent = ({
  message,
  content,
  onRespond,
}: SupportChatContentProps): React.ReactElement => {
  const items = getC3ContentItems(content);
  if (items.length === 0) {
    return <ChatMarkdown content={message} />;
  }
  return (
    <React.Fragment>
      {items.map((item, index) => (
        // Items have no id of their own, and a message's items never change once it arrives.
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className="support-chat-content-item">
          {renderItem(item, onRespond)}
        </div>
      ))}
    </React.Fragment>
  );
};

export default SupportChatContent;
