import React, { useEffect, useState } from "react";
import { VisuallyHidden } from "@rbx/foundation-ui";

export const AI_DISCLOSURE = "This is an AI-powered conversation. It can make mistakes.";
const PRIVACY_REMINDER = "Don’t share your password or full payment information.";
export const DISCLAIMERS = [AI_DISCLOSURE, PRIVACY_REMINDER] as const;
export const DISCLAIMER_INTERVAL_MS = 4000;

/**
 * The reminders below the chat's message box, sharing one line: each slides up to the next in turn.
 * Hovering, focusing, or pressing the line holds it. The control's name is the action plus the
 * reminder on screen, and it does not also set a pressed state. With reduced motion the two stay
 * stacked and there is no control.
 */
const SupportChatDisclaimers = (): React.ReactElement => {
  const [shown, setShown] = useState(0);
  const [hasRotated, setHasRotated] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const paused = reduceMotion || pinned || hovered || focused;
  const actionLabel = pinned ? "Resume reminders" : "Pause reminders";

  useEffect(() => {
    // The DOM lib types matchMedia as always present. The test environment does not have it.
    const media = globalThis as { matchMedia?: (query: string) => MediaQueryList };
    const query = media.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (query == null) {
      return;
    }
    const update = () => {
      setReduceMotion(query.matches);
      // The button unmounts in this mode, and that does not fire leave or blur.
      if (query.matches) {
        setHovered(false);
        setFocused(false);
      }
    };
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (paused) {
      return;
    }
    const timer = setInterval(() => {
      setShown(current => (current + 1) % DISCLAIMERS.length);
      setHasRotated(true);
    }, DISCLAIMER_INTERVAL_MS);
    return () => {
      clearInterval(timer);
    };
  }, [paused]);

  const previous = (shown - 1 + DISCLAIMERS.length) % DISCLAIMERS.length;
  const stateOf = (index: number) => {
    if (index === shown) {
      return hasRotated ? "entering" : "shown";
    }
    return hasRotated && index === previous ? "leaving" : "hidden";
  };

  if (reduceMotion) {
    return (
      <div className="support-chat-disclaimers">
        {DISCLAIMERS.map(text => (
          <span key={text} className="support-chat-disclaimer text-caption-small content-default">
            {text}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="support-chat-disclaimers">
      {/* Read once, in full, so a screen reader isn't interrupted as the line changes. */}
      {DISCLAIMERS.map(text => (
        <VisuallyHidden key={text}>{text}</VisuallyHidden>
      ))}
      {/* Hovering, focusing, or pressing holds the current reminder so it can be read. */}
      <button
        type="button"
        className="support-chat-disclaimers-track"
        aria-label={`${actionLabel}: ${DISCLAIMERS[shown]}`}
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        onClick={() => {
          setPinned(current => !current);
        }}
      >
        {DISCLAIMERS.map((text, index) => (
          <span
            key={text}
            className={`support-chat-disclaimer text-caption-small content-default is-${stateOf(index)}`}
            aria-hidden
          >
            {text}
          </span>
        ))}
      </button>
    </div>
  );
};

export default SupportChatDisclaimers;
