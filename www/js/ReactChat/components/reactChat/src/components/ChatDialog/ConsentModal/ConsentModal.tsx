import { createPortal } from "react-dom";
import { Button, IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import type { TChatConversation } from "../../../types/chat";
import AvatarHeadshot from "../../AvatarHeadshot";

const HELP_ARTICLE_URL =
  "https://en.help.roblox.com/hc/en-us/articles/360000432483-Party-chat-In-App";

const formatCreatedOn = (createdAt?: string): string => {
  if (!createdAt) {
    return "";
  }
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

type TConsentModalProps = {
  conversation: TChatConversation;
  expandedChatEnabled: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
};

/**
 * Blocking group-OSA / U13 opt-in consent modal: title, a "group created on" line (copy branches on
 * expanded chat), the member list, a safety notice with a help link, and Join / Don't-Join actions.
 * Rendered as a centered modal over a full-screen backdrop (portaled to the body), matching the
 * legacy conversation-invite dialog — not an in-dialog panel.
 */
const ConsentModal = ({
  conversation,
  expandedChatEnabled,
  onAccept,
  onDecline,
  onClose,
}: TConsentModalProps) => {
  const { translate } = useTranslation();
  const createdOn = formatCreatedOn(conversation.createdAt);

  const groupInfo = expandedChatEnabled
    ? translate("Description.ConversationInviteGroupCreatedOn", { creation_date: createdOn })
    : translate("Description.OSAGroupCreatedOnVariant1", {
        group_name: conversation.title,
        creation_date: createdOn,
      });

  return createPortal(
    // Backdrop click (on the scrim itself, not its children) dismisses; keyboard/AT users dismiss
    // via the focusable Close button below.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="flex items-center justify-center padding-xlarge"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--color-common-backdrop)",
        zIndex: 9999,
      }}
      onClick={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex flex-col overflow-hidden bg-surface-100 stroke-standard stroke-muted radius-large shadow-transient-high"
        style={{ minWidth: "376px", maxWidth: "480px", width: "100%", maxHeight: "80vh" }}
      >
        <div className="flex shrink-0 items-center gap-small padding-medium">
          <span className="min-width-0 grow-1 text-title-large content-emphasis text-truncate-end">
            {translate("Heading.YouWereInvitedToGroup")}
          </span>
          <IconButton
            ariaLabel={translate("Action.Close")}
            icon="icon-regular-x"
            size="Small"
            variant="Utility"
            isCircular
            onClick={onClose}
          />
        </div>

        <div className="flex min-height-0 grow-1 flex-col gap-medium scroll-y padding-x-medium">
          <span className="text-body-medium content-default">{groupInfo}</span>

          {conversation.participants.length > 0 && (
            <ul className="flex flex-col gap-small">
              {conversation.participants.map(member => {
                const usernameLabel = `@${member.username}`;
                return (
                  <li key={member.id} className="flex items-center gap-small">
                    <AvatarHeadshot
                      userId={member.id}
                      displayName={member.displayName}
                      containerClassName="size-800 radius-circle bg-shift-300 clip"
                    />
                    <div className="min-width-0 grow-1">
                      <div className="text-body-medium content-emphasis text-truncate-end">
                        {member.displayName}
                      </div>
                      <div className="text-caption-medium content-muted text-truncate-end">
                        {usernameLabel}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <span className="text-body-medium content-default">
            {translate("Description.OSAGroupDescription")}{" "}
            <a href={HELP_ARTICLE_URL} target="_blank" rel="noopener noreferrer">
              {translate("Label.ViewDetailsButton")}
            </a>
          </span>
        </div>

        <div className="flex shrink-0 flex-col gap-small padding-medium">
          <Button variant="Emphasis" size="Medium" onClick={onAccept}>
            {translate("Action.GroupOSAJoin")}
          </Button>
          <Button variant="Standard" size="Medium" onClick={onDecline}>
            {translate("Action.GroupOSADoNotJoin")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConsentModal;
