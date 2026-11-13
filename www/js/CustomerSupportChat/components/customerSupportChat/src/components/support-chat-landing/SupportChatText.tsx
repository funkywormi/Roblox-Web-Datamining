import React from "react";
import { VisuallyHidden } from "@rbx/foundation-ui";

const ASSISTANT_SAID = "Roblox Support said:";
const USER_SAID = "You said:";
const THINKING = "Roblox Support is typing";

/** A Roblox Support message in the v14 session: plain text on the page. */
export const SupportChatAssistantText = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="support-chat-assistant">
    <VisuallyHidden>{ASSISTANT_SAID}</VisuallyHidden>
    <div className="support-chat-assistant-text text-body-medium content-default">{children}</div>
  </div>
);

/** The visitor's message in the v14 session: a bubble on the trailing side. */
export const SupportChatUserText = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="support-chat-user">
    <VisuallyHidden>{USER_SAID}</VisuallyHidden>
    <div className="support-chat-user-text text-body-medium content-emphasis">{children}</div>
  </div>
);

/** Shown while Roblox Support is answering. */
export const SupportChatThinking = (): React.ReactElement => (
  <div className="support-chat-assistant" role="status">
    <VisuallyHidden>{THINKING}</VisuallyHidden>
    <span className="support-chat-thinking" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  </div>
);
