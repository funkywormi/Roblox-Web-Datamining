import React, { useEffect, useRef } from "react";
import { Icon } from "@rbx/foundation-ui";
import "./SupportChatSession.scss";

const TITLE = "Roblox Support";
const DISCLOSURE = "AI can make mistakes. Check important info.";

type SupportChatSessionProps = {
  /** The conversation so far. */
  children: React.ReactNode;
  /** Pinned below the conversation, such as the message box. */
  dock: React.ReactNode;
  /** The newest message scrolls into view whenever this changes. */
  scrollKey?: unknown;
  "data-testid"?: string;
};

/**
 * The support chat: the Roblox Support conversation with the message box pinned below it. The
 * landing shows its first message here while the chat starts, so the page doesn't change again
 * when the conversation arrives.
 */
const SupportChatSession = ({
  children,
  dock,
  scrollKey,
  "data-testid": testId,
}: SupportChatSessionProps): React.ReactElement => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The log scrolls on wide screens and the page does on narrow ones; this moves whichever does.
    // jsdom has no scrollIntoView.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    logRef.current?.lastElementChild?.scrollIntoView?.({ block: "nearest" });
  }, [scrollKey]);

  return (
    <div className="support-session" data-testid={testId}>
      <section className="support-session-column" aria-labelledby="support-session-title">
        <div className="support-session-heading">
          <span className="support-session-mark">
            <Icon name="icon-regular-headphones" size="Medium" aria-hidden />
          </span>
          <div className="support-session-identity">
            <h1 id="support-session-title" className="text-title-medium content-emphasis">
              {TITLE}
            </h1>
            <p className="support-session-disclosure text-caption-small content-muted">
              {DISCLOSURE}
            </p>
          </div>
        </div>
        <div
          className="support-session-log"
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-labelledby="support-session-title"
          // Focusable so the keyboard can scroll back through it when it has no links.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        >
          {children}
        </div>
        <div className="support-session-dock">{dock}</div>
      </section>
    </div>
  );
};

export default SupportChatSession;
