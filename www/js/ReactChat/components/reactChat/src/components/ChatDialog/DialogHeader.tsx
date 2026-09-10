import classNames from "classnames";
import type { MouseEvent } from "react";
import { Badge, IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  DisplayNameBadges,
  useIsPlusBadgeEnabled,
  PLUS_BADGE_ARIA_LABEL,
  PLUS_BADGE_ARIA_LABEL_KEY,
} from "@rbx/identity-badges";
import { CHAT_MODERATION_TYPE } from "../../constants/chatPolicyConstants";
import type { TChatConversation } from "../../types/chat";
import { presenceDotClassByType } from "../../utils/presenceStyles";
import AvatarHeadshot from "../AvatarHeadshot";

type TDialogHeaderProps = {
  conversation: TChatConversation;
  onClose: (layoutId: string) => void;
  onToggleCollapsed: (layoutId: string) => void;
  onOpenDetails: (layoutId: string) => void;
};

const DialogHeader = ({
  conversation,
  onClose,
  onToggleCollapsed,
  onOpenDetails,
}: TDialogHeaderProps) => {
  const { translate } = useTranslation();
  const primaryParticipant = conversation.participants[0];
  const isPlusBadgeEnabled = useIsPlusBadgeEnabled();
  // SUBS-5048: Plus badge only renders for Direct (1:1) conversations
  // because group titles are a comma-joined list, not a single user.
  const showPlusBadge =
    isPlusBadgeEnabled &&
    conversation.dialogType === "Direct" &&
    primaryParticipant?.isRobloxPlus === true;
  const showUnfilteredChatIndicator =
    conversation.moderationType === CHAT_MODERATION_TYPE.trusted_comms;
  const unfilteredChatLabel = showUnfilteredChatIndicator
    ? translate("Label.UnfilteredChat")
    : undefined;

  return (
    <div
      className="react-chat-dialog-header react-chat-top-radius flex width-full shrink-0 items-center gap-small overflow-hidden bg-surface-100 padding-x-small padding-y-small cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => {
        onToggleCollapsed(conversation.layoutId);
      }}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggleCollapsed(conversation.layoutId);
        }
      }}
      aria-label={
        unfilteredChatLabel ? `${conversation.title}, ${unfilteredChatLabel}` : conversation.title
      }
      aria-expanded={conversation.isCollapsed !== true}
    >
      <div
        className="react-chat-dialog-header-main flex min-width-0 grow-1 items-center gap-small overflow-hidden"
        aria-hidden="true"
      >
        {primaryParticipant && (
          <span className="react-chat-dialog-avatar-wrap relative shrink-0">
            <AvatarHeadshot
              userId={primaryParticipant.id}
              displayName={primaryParticipant.displayName}
              containerClassName="size-800 radius-circle bg-shift-300 clip"
            />
            {primaryParticipant.presence !== "Offline" && (
              <span
                className={classNames(
                  "react-chat-dialog-presence-dot absolute radius-circle stroke-standard",
                  presenceDotClassByType[primaryParticipant.presence],
                )}
              />
            )}
          </span>
        )}
        <span className="flex min-width-0 grow-1 flex-col">
          <span className="flex min-width-0 items-center gap-xsmall">
            <span className="react-chat-dialog-title min-width-0 grow-1 text-title-medium content-emphasis text-truncate-end">
              {conversation.title}
            </span>
            {showPlusBadge && (
              <span className="shrink-0">
                <DisplayNameBadges
                  isRobloxPlus
                  size="Small"
                  plusBadgeAriaLabel={translate(
                    PLUS_BADGE_ARIA_LABEL_KEY,
                    undefined,
                    PLUS_BADGE_ARIA_LABEL,
                  )}
                />
              </span>
            )}
          </span>
          {unfilteredChatLabel && (
            <span className="text-caption-medium content-default text-truncate-end">
              {unfilteredChatLabel}
            </span>
          )}
        </span>
      </div>
      <div className="react-chat-dialog-header-actions flex shrink-0 items-center gap-xsmall">
        {conversation.unreadCount > 0 && (
          <span className="react-chat-dialog-unread-badge shrink-0">
            <Badge label={String(conversation.unreadCount)} variant="Emphasis" />
          </span>
        )}
        <IconButton
          ariaLabel={translate("Label.ChatDetails")}
          icon="icon-regular-gear"
          size="Small"
          variant="Utility"
          isCircular
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onOpenDetails(conversation.layoutId);
          }}
        />
        <IconButton
          ariaLabel={translate("Action.Close")}
          icon="icon-regular-x"
          size="Small"
          variant="Utility"
          isCircular
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            onClose(conversation.layoutId);
          }}
        />
      </div>
    </div>
  );
};

export default DialogHeader;
