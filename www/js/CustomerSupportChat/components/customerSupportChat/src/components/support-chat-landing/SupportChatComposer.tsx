import React, {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { IconButton, TextArea, VisuallyHidden } from "@rbx/foundation-ui";
import SupportChatDisclaimers, { AI_DISCLOSURE } from "./SupportChatDisclaimers";
import "./SupportChatComposer.scss";

const LABEL = { chat: "Write a message", landing: "Describe what happened" } as const;
const SUBMIT = "Send message";
// Only one message box is on the page at a time.
const LIMIT_WARNING_ID = "support-chat-composer-limit";
const AI_DISCLOSURE_ID = "support-chat-composer-ai";
// Said once, when the draft first crosses the limit. The count itself changes on every keystroke.
const LIMIT_ANNOUNCEMENT = "Message is too long to send.";
// Used when the stylesheet's max-height can't be read. The stylesheet also caps the chat field by
// the space left in a short window.
const FIELD_MAX_HEIGHT = { chat: 200, landing: 240 } as const;

/**
 * Grows the field to fit its text, up to its max-height, then lets it scroll. The chat field stays
 * one pill, with the send button on the last line, so a taller draft grows up from the bottom of
 * the frame. The landing field grows down.
 */
const fitToText = (field: HTMLTextAreaElement, fallbackMax: number) => {
  const styledMax = Number.parseFloat(getComputedStyle(field).maxHeight);
  const max = Number.isFinite(styledMax) ? styledMax : fallbackMax;
  // max-height would clip scrollHeight, so it is cleared while measuring.
  field.style.maxHeight = "none";
  field.style.height = "auto";
  const full = field.scrollHeight;
  field.style.maxHeight = "";
  field.style.height = `${Math.min(full, max)}px`;
  field.style.overflowY = full > max ? "auto" : "hidden";
};

const count = (value: number) => value.toLocaleString("en-US");
const limitWarning = (length: number, maxLength: number) =>
  `${count(length)} / ${count(maxLength)} characters. Remove ${count(length - maxLength)} to send.`;

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
  /** The landing's box is taller and raised, and has no reminders below it. */
  variant?: "chat" | "landing";
};

/** The support message box, with the send button inside it and the AI and privacy reminders below. */
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
  const fieldRef = useRef<HTMLTextAreaElement>(null);
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

  const maxHeight = FIELD_MAX_HEIGHT[variant];
  const label = LABEL[variant];
  useLayoutEffect(() => {
    if (fieldRef.current) {
      fitToText(fieldRef.current, maxHeight);
    }
  }, [draft, maxHeight]);

  // The same text wraps onto more lines when the field narrows or its font loads. The chat cap
  // follows the window height and --support-session-top, which the session sets after this first
  // fit and again when a banner arrives; a lower cap resizes the field, so the observer catches it.
  // Refitting leaves the size unchanged, so the observer doesn't fire again.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) {
      return undefined;
    }
    const refit = () => {
      fitToText(field, maxHeight);
    };
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(refit);
    observer?.observe(field);
    window.addEventListener("resize", refit);
    // jsdom has no font loading API.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    document.fonts?.addEventListener("loadingdone", refit);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", refit);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      document.fonts?.removeEventListener("loadingdone", refit);
    };
  }, [maxHeight]);

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
          ref={fieldRef}
          aria-label={label}
          aria-describedby={
            isTooLong
              ? variant === "chat"
                ? `${LIMIT_WARNING_ID} ${AI_DISCLOSURE_ID}`
                : LIMIT_WARNING_ID
              : undefined
          }
          placeholder={label}
          size={variant === "landing" ? "Large" : "Medium"}
          rows={1}
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
        {isTooLong && <VisuallyHidden>{LIMIT_ANNOUNCEMENT}</VisuallyHidden>}
      </div>
      {isTooLong && (
        <p
          id={LIMIT_WARNING_ID}
          className="support-chat-composer-warning text-caption-small text-system-alert"
        >
          {limitWarning(draft.length, maxLength)}
        </p>
      )}
      {/* Hidden rather than unmounted, so a visitor's pause survives the count. */}
      {variant === "chat" && (
        <div hidden={isTooLong}>
          <SupportChatDisclaimers />
        </div>
      )}
      {variant === "chat" && isTooLong && (
        <VisuallyHidden id={AI_DISCLOSURE_ID}>{AI_DISCLOSURE}</VisuallyHidden>
      )}
    </form>
  );
};

export default SupportChatComposer;
