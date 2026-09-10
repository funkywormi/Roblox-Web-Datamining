import { useLayoutEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { TextArea } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

type TMessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping?: () => void;
  /** Receives every keydown/keyup for keystroke telemetry; a no-op unless collection is enabled. */
  onKeyEvent?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  isDisabled?: boolean;
  isFocused?: boolean;
};

const MessageInput = ({
  value,
  onChange,
  onSend,
  onTyping,
  onKeyEvent,
  isDisabled = false,
  isFocused = false,
}: TMessageInputProps) => {
  const { translate } = useTranslation();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) {
      return;
    }

    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
  }, [value]);

  useLayoutEffect(() => {
    if (isFocused) {
      textAreaRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <div className="flex items-end bg-surface-100 padding-bottom-medium padding-x-medium padding-top-small">
      <TextArea
        ref={textAreaRef}
        className="react-chat-message-input width-full"
        value={value}
        onChange={event => {
          onChange(event.currentTarget.value);
          onTyping?.();
        }}
        placeholder={translate("Label.InputPlaceHolder.SendMessage")}
        rows={1}
        size="Small"
        textareaClassName="react-chat-message-input-textarea max-height-[96px] scroll-y"
        isDisabled={isDisabled}
        aria-label={translate("Label.InputPlaceHolder.SendMessage")}
        onKeyDown={event => {
          onKeyEvent?.(event);
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        onKeyUp={onKeyEvent}
      />
    </div>
  );
};

export default MessageInput;
