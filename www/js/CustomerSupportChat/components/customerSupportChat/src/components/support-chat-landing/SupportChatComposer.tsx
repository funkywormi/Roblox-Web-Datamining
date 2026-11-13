import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { IconButton, TextArea } from "@rbx/foundation-ui";
import "./SupportChatComposer.scss";

const LABEL = "Describe what happened";
const SUBMIT = "Send message";
const CAPTION = "Don’t share your password or full payment information.";
// Only one message box is on the page at a time.
const LIMIT_WARNING_ID = "support-chat-composer-limit";
const limitWarning = (maxLength: number) =>
  `Messages can be up to ${maxLength.toLocaleString("en-US")} characters. Shorten yours to send it.`;

/**
 * Enter sends; Shift+Enter and an open IME composition keep typing. Safari fires the Enter that
 * commits a composition after compositionend, with keyCode 229 and isComposing false.
 */
const submitsOnEnter =
  (submit: () => Promise<void>) =>
  (event: KeyboardEvent<HTMLTextAreaElement>): Promise<void> | undefined => {
    // keyCode is deprecated, but it is the only signal Safari gives for this Enter.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isComposing = event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229;
    if (event.key === "Enter" && !event.shiftKey && !isComposing) {
      event.preventDefault();
      return submit();
    }
    return undefined;
  };

type SupportChatComposerProps = {
  /**
   * Sends the trimmed message. The box clears right away; a rejection, such as a closed captcha,
   * puts the message back, ahead of anything typed since.
   */
  onSubmit: (message: string) => void | Promise<void>;
  isDisabled?: boolean;
  /** Longer text stays in the box, with a warning, and can't be sent until it is shortened. */
  maxLength: number;
  /** For a box that is the main thing on the page, such as the landing's. */
  focusOnMount?: boolean;
  /** Text to start with, such as what was typed on the landing while the chat was starting. */
  initialDraft?: string;
  /**
   * Text that may arrive after the box is shown, such as an article title being looked up. It
   * fills the box once, and only while the box is empty and the visitor has not typed in it.
   */
  prefill?: string;
  onDraftChange?: (draft: string) => void;
  /** The landing's box is taller and raised, and has no privacy reminder below it. */
  variant?: "chat" | "landing";
};

/** The support message box, with the send button inside it and the privacy reminder below. */
const SupportChatComposer = ({
  onSubmit,
  isDisabled = false,
  maxLength,
  focusOnMount = false,
  initialDraft = "",
  prefill,
  onDraftChange,
  variant = "chat",
}: SupportChatComposerProps): React.ReactElement => {
  const [draft, setDraft] = useState(initialDraft);
  const isMounted = useRef(true);
  const hasTyped = useRef(false);
  const isTooLong = draft.length > maxLength;

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  useEffect(() => {
    if (prefill && !hasTyped.current) {
      setDraft(current => current || prefill);
    }
  }, [prefill]);

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  const submit = async () => {
    const message = draft.trim();
    if (isDisabled || isTooLong || !message) {
      return;
    }
    setDraft("");
    try {
      await onSubmit(message);
    } catch {
      if (isMounted.current) {
        // Keep both the unsent message and anything typed after it.
        setDraft(current => (current ? `${message}\n${current}` : message));
      }
    }
  };

  return (
    <form
      className={`support-chat-composer support-chat-composer-${variant}`}
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        return submit();
      }}
    >
      <div className="support-chat-composer-surface">
        <TextArea
          aria-label={LABEL}
          aria-describedby={isTooLong ? LIMIT_WARNING_ID : undefined}
          placeholder={LABEL}
          size={variant === "landing" ? "Large" : "Medium"}
          rows={variant === "landing" ? 1 : 2}
          hasError={isTooLong}
          textareaClassName="support-chat-composer-field"
          value={draft}
          onChange={event => {
            hasTyped.current = true;
            setDraft(event.target.value);
          }}
          onKeyDown={submitsOnEnter(submit)}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={focusOnMount}
        />
        <span className="support-chat-composer-send">
          <IconButton
            type="submit"
            icon="icon-filled-arrow-wide-short-up"
            ariaLabel={SUBMIT}
            variant="Emphasis"
            size="Small"
            isCircular
            isDisabled={isDisabled || isTooLong || !draft.trim()}
          />
        </span>
      </div>
      <div aria-live="polite">
        {isTooLong && (
          <p
            id={LIMIT_WARNING_ID}
            className="support-chat-composer-warning text-caption-small text-system-alert"
          >
            {limitWarning(maxLength)}
          </p>
        )}
      </div>
      {variant === "chat" && (
        <p className="support-chat-composer-caption text-caption-small content-default">
          {CAPTION}
        </p>
      )}
    </form>
  );
};

export default SupportChatComposer;
