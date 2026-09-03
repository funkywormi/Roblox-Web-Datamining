import React, { useEffect, useRef, useState, KeyboardEvent, useCallback } from "react";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";
import "./ChatInput.scss";

const MESSAGE_MAX_LENGTH = 2000;

/**
 *  Hook to auto resize textarea as user types
 * @param textareaRef - Ref to textarea element
 */
const useTextAreaAutoResize = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
  useEffect(() => {
    const handleInput = () => {
      const currentTextarea = textareaRef.current;
      if (currentTextarea) {
        currentTextarea.style.height = "auto"; // Reset height
        currentTextarea.style.height = `${currentTextarea.scrollHeight}px`; // Set to scrollHeight
        currentTextarea.style.overflowY =
          currentTextarea.scrollHeight > currentTextarea.clientHeight ? "scroll" : "hidden";
      }
    };

    const textarea = textareaRef.current;
    textarea?.addEventListener("input", handleInput);

    return () => {
      if (textarea) {
        textarea.removeEventListener("input", handleInput);
      }
    };
  }, [textareaRef]);
};

type ChatInputProps = {
  sendMessage: (message: string) => void;
  disabled?: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ sendMessage, disabled }) => {
  const { translate: t } = useTranslation();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useTextAreaAutoResize(textareaRef);
  const characterLimitMessage = t("Chat.Description.MessageTooLong", {
    limit: MESSAGE_MAX_LENGTH,
  });

  const charLimitExceeded = message.length > MESSAGE_MAX_LENGTH;

  const disableSendButton = !message.trim().length || disabled || charLimitExceeded;

  const handleSend = useCallback(() => {
    if (disableSendButton) return;
    sendMessage(message);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height
    }
  }, [disableSendButton, message, sendMessage]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="c3-chat-input-container">
      <div className="c3-chat-input">
        <div className={`c3-chat-input-textarea ${charLimitExceeded ? "message-limit" : ""}`}>
          <textarea
            aria-hidden="false"
            value={message}
            onKeyDown={handleKeyPress}
            onChange={e => {
              setMessage(e.target.value);
            }}
            ref={textareaRef}
            className="prompt-text-area"
            placeholder={t("Chat.Description.WriteMessage")}
            rows={1}
            data-testid="c3-chat-input"
          />
        </div>
        <button
          disabled={disableSendButton}
          type="button"
          className="c3-send-button"
          onClick={handleSend}
          data-testid="c3-chat-send-button"
        >
          <span className={`icon-uiblox-send ${disableSendButton ? "disabled" : ""}`} />
        </button>
        <Tooltip
          delayShow={1500}
          anchorSelect=".c3-send-button"
          place="top"
          border="1px solid var(--color-stroke-default)"
          style={{
            background: "var(--color-surface-300)",
            color: "var(--color-content-emphasis)",
            padding: "var(--padding-small)",
            fontSize: "calc(var(--font-size-350) * 1px)",
            borderRadius: "var(--radius-medium)",
          }}
        >
          {t("Chat.Action.SendMessage")}
        </Tooltip>
      </div>
      <span
        data-testid="c3-chat-input-char-limit-warning"
        className={`c3-chat-input-warning ${charLimitExceeded ? "c3-input-warning-visible" : ""}`}
      >
        {characterLimitMessage}
      </span>
    </div>
  );
};

export default ChatInput;
