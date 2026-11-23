import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Icon } from "@rbx/foundation-ui";
import "./SupportChatSession.scss";

const TITLE = "Roblox Support";

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
  const frameRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const dockEl = dockRef.current;
    if (!frame || !dockEl) {
      return undefined;
    }
    // On narrow screens the dock is sticky over the log and grows with the draft, so the space
    // a scrolled message leaves for it follows its height. Set before the first scroll below.
    const apply = () => {
      frame.style.setProperty("--support-session-dock-height", `${dockEl.offsetHeight}px`);
    };
    apply();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(apply);
    observer?.observe(dockEl);
    return () => {
      observer?.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return undefined;
    }
    // A banner or a taller header sits above #support, so a fixed offset pushes the message
    // box below the fold. The document offset stays right after the page scrolls, and a banner
    // that arrives later (such as the account prompt) resizes the body.
    const apply = () => {
      const top = Math.max(0, Math.round(frame.getBoundingClientRect().top + window.scrollY));
      const next = `${top}px`;
      if (frame.style.getPropertyValue("--support-session-top") !== next) {
        frame.style.setProperty("--support-session-top", next);
      }
    };
    // jsdom's scrollTo only logs that it is not implemented.
    if (!navigator.userAgent.includes("jsdom")) {
      window.scrollTo(0, 0);
    }
    apply();
    window.addEventListener("resize", apply);
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(apply);
    observer?.observe(document.body);
    return () => {
      window.removeEventListener("resize", apply);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    // The log scrolls on wide screens and the page does on narrow ones; this moves whichever does.
    // jsdom has no scrollIntoView.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    logRef.current?.lastElementChild?.scrollIntoView?.({ block: "nearest" });
  }, [scrollKey]);

  return (
    <div className="support-session" data-testid={testId} ref={frameRef}>
      <section className="support-session-column" aria-labelledby="support-session-title">
        <div className="support-session-heading">
          <span className="support-session-mark">
            <Icon name="icon-regular-headphones" size="Large" aria-hidden />
          </span>
          <h1
            id="support-session-title"
            className="support-session-title text-heading-small content-emphasis"
          >
            {TITLE}
          </h1>
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
        <div className="support-session-dock" ref={dockRef}>
          {dock}
        </div>
      </section>
    </div>
  );
};

export default SupportChatSession;
