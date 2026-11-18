import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@rbx/foundation-ui";
import SupportChatSession from "./SupportChatSession";
import SupportChatComposer from "./SupportChatComposer";
import { SupportChatThinking, SupportChatUserText } from "./SupportChatText";
import { COMMON_ISSUES } from "./supportChatLandingContent";
import "./SupportChatLanding.scss";

const HEADING = "How can we help?";
const COMMON_ISSUES_LABEL = "Common issues";
/** The conversation endpoint refuses a longer first message. */
const MESSAGE_MAX_LENGTH = 1000;

type SupportChatLandingProps = {
  /**
   * Starts the conversation with the visitor's first message. A rejection, such as a closed
   * captcha, returns to the landing with the message back in the box. Until a sender is passed,
   * nothing can be sent.
   */
  onSend?: (message: string) => void | Promise<void>;
  /** Follows the message box, so text typed while the first message sends can move to the chat. */
  onDraftChange?: (draft: string) => void;
  /** The title of the Help Center article the visitor came from, once it is known. */
  articlePrefill?: string;
  /** The visitor edited or cleared that title, so a remount must not fill it again. */
  onPrefillDismiss?: () => void;
};

/**
 * The new support landing, following the v5 mock: one message box, with the common issues below
 * it. A typed message or a chosen issue starts the conversation, which shows in the chat frame
 * while it is created.
 */
const SupportChatLanding = ({
  onSend,
  onDraftChange,
  articlePrefill,
  onPrefillDismiss,
}: SupportChatLandingProps): React.ReactElement => {
  // `carried` is text already in the box when an issue was chosen, so it stays in the box.
  const [pending, setPending] = useState<{ text: string; carried: string }>();
  const [homeDraft, setHomeDraft] = useState("");
  // The home composer unmounts while a message is sending, so this has to outlive it. Once the
  // visitor changes the prefilled title, a new composer must not put that title back.
  const [prefillDismissed, setPrefillDismissed] = useState(false);
  const sawPrefill = useRef(false);
  // What is in the home box, and what is in the chat frame's box while the first message sends.
  const homeBox = useRef("");
  const followUp = useRef("");
  const isMounted = useRef(true);
  const canSend = onSend !== undefined && pending === undefined;

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  const noteHomeDraft = (draft: string) => {
    homeBox.current = draft;
    if (prefillDismissed) {
      return;
    }
    if (articlePrefill && draft === articlePrefill) {
      sawPrefill.current = true;
      return;
    }
    // "" is the box before the title is written in. The visitor's own text, or clearing the title
    // after it was shown, means a later remount must not fill the title again.
    const visitorTypedTheirOwn = draft !== "" && draft !== articlePrefill;
    const visitorClearedTheTitle = sawPrefill.current && draft !== articlePrefill;
    if (visitorTypedTheirOwn || visitorClearedTheTitle) {
      setPrefillDismissed(true);
      onPrefillDismiss?.();
    }
  };

  const send = async (text: string, wasTyped: boolean) => {
    if (!canSend) {
      return;
    }
    // A typed message was just cleared from the box by sending it.
    const carried = wasTyped ? "" : homeBox.current;
    followUp.current = carried;
    setPending({ text, carried });
    try {
      await onSend(text);
    } catch {
      if (isMounted.current) {
        // A chosen issue is a button, so only a typed message goes back in the box.
        setHomeDraft([wasTyped ? text : "", followUp.current].filter(Boolean).join("\n"));
        setPending(undefined);
      }
    }
  };

  if (pending !== undefined) {
    return (
      <SupportChatSession
        data-testid="support-chat-landing"
        dock={
          <SupportChatComposer
            onSubmit={() => undefined}
            isDisabled
            maxLength={MESSAGE_MAX_LENGTH}
            focusOnMount
            initialDraft={pending.carried}
            onDraftChange={draft => {
              followUp.current = draft;
              onDraftChange?.(draft);
            }}
          />
        }
      >
        <SupportChatUserText>{pending.text}</SupportChatUserText>
        <SupportChatThinking />
      </SupportChatSession>
    );
  }

  return (
    <div className="support-chat-landing-home" data-testid="support-chat-landing">
      <div className="support-chat-landing-intro">
        <Icon name="icon-regular-headphones" size="XXLarge" aria-hidden />
        <h1 id="support-chat-heading" className="text-heading-medium content-emphasis">
          {HEADING}
        </h1>
      </div>

      <SupportChatComposer
        variant="landing"
        onSubmit={message => send(message, true)}
        isDisabled={!canSend}
        maxLength={MESSAGE_MAX_LENGTH}
        focusOnMount
        initialDraft={homeDraft}
        prefill={prefillDismissed ? undefined : articlePrefill}
        onDraftChange={noteHomeDraft}
      />

      <ul className="support-chat-landing-issues" aria-label={COMMON_ISSUES_LABEL}>
        {COMMON_ISSUES.map(issue => (
          <li key={issue.text}>
            <button
              type="button"
              className="support-chat-landing-issue text-body-medium"
              disabled={!canSend}
              onClick={() => send(issue.text, false)}
            >
              <Icon name={issue.iconName} size="Small" aria-hidden />
              {issue.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupportChatLanding;
