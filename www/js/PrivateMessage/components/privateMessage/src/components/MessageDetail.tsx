import { Button, Checkbox, TextArea } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { BadgeSizes, VerifiedBadgeIconContainer } from "@rbx/roblox-badges";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { MESSAGE_TABS, ROBLOX_USER, USER_HANDLE_PREFIX } from "../constants";
import { formatDetailDate } from "../utils/messageUtils";
import type { MessageItem, MessageTab, SendReplyState } from "../types";
import ClickBoundary from "./ClickBoundary";
import SystemRobloxLogo from "./SystemRobloxLogo";

const SenderAvatar = ({
  message,
  activeTab,
}: {
  message: MessageItem;
  activeTab: MessageTab;
}): React.ReactElement => {
  const user = activeTab === MESSAGE_TABS.sent ? message.recipient : message.sender;
  const isRobloxSystemUser =
    activeTab !== MESSAGE_TABS.sent && message.sender.id === ROBLOX_USER.id;

  return (
    <a href={user.profileLink} className="size-800 shrink-0 flex items-center justify-center">
      {isRobloxSystemUser ? (
        <SystemRobloxLogo className="size-800" />
      ) : (
        <span className="radius-small clip size-800">
          <Thumbnail2d
            targetId={user.id}
            type={ThumbnailTypes.avatarHeadshot}
            altName={user.displayName}
          />
        </span>
      )}
    </a>
  );
};

const MessageDetail = ({
  message,
  activeTab,
  sendReplyState,
  onReplyContentChange,
  onIncludePreviousMessageChange,
  onSendReply,
}: {
  message: MessageItem | null;
  activeTab: MessageTab;
  sendReplyState: SendReplyState;
  onReplyContentChange: (content: string) => void;
  onIncludePreviousMessageChange: (includePreviousMessage: boolean) => void;
  onSendReply: () => void;
}): React.ReactElement | null => {
  const { translate } = useTranslation();

  if (!message) {
    return null;
  }

  const user = activeTab === MESSAGE_TABS.sent ? message.recipient : message.sender;
  const canReply = activeTab === MESSAGE_TABS.inbox && !message.isSystemMessage;

  return (
    <div className="bg-surface-100 stroke-standard stroke-muted radius-medium padding-large">
      <div className="flex justify-between gap-medium">
        <div className="min-width-0">
          <h2 className="text-heading-medium content-emphasis margin-none text-wrap">
            {message.subject}
          </h2>
          <div className="flex gap-small margin-top-medium">
            <SenderAvatar message={message} activeTab={activeTab} />
            <div className="min-width-0 flex flex-col gap-y-small">
              <a
                href={user.profileLink}
                className="text-title-medium content-emphasis flex items-center gap-xsmall"
              >
                <span>{user.displayName}</span>
                {user.hasVerifiedBadge ? (
                  <VerifiedBadgeIconContainer size={BadgeSizes.CAPTIONHEADER} />
                ) : null}
              </a>
              <div className="text-body-medium content-muted">
                {USER_HANDLE_PREFIX}
                {user.name}
              </div>
              <div className="text-caption-medium content-muted">
                {formatDetailDate(message.created)}
              </div>
            </div>
          </div>
        </div>
        {message.isReportAbuseDisplayed ? (
          <a
            href={message.abuseReportUrl}
            className="text-body-medium content-muted text-no-wrap abuse-report-modal"
          >
            {translate("Action.ReportAbuse")}
          </a>
        ) : null}
      </div>
      <div
        className="private-message-body text-body-large content-default margin-top-large"
        // Message bodies are sanitized/linkified before being rendered here.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: message.body }}
      />
      {canReply ? (
        <div className="margin-top-large">
          <TextArea
            size="Medium"
            label={translate("Message.ReplyHere")}
            placeholder={translate("Message.ReplyHere")}
            value={sendReplyState.replyContent}
            onChange={event => {
              onReplyContentChange(event.target.value);
            }}
            textareaStyle={{ resize: "vertical", minHeight: 120 }}
          />
          <div className="flex items-center justify-between gap-medium wrap margin-top-medium">
            <span className="text-caption-medium content-muted">
              {translate("Message.IdTheftWarning")}
            </span>
            <div className="flex items-center gap-medium wrap">
              <ClickBoundary>
                <Checkbox
                  label={translate("Label.IncludeMessage")}
                  size="Medium"
                  placement="End"
                  isChecked={sendReplyState.includePreviousMessage}
                  onCheckedChange={checked => {
                    onIncludePreviousMessageChange(checked === true);
                  }}
                />
              </ClickBoundary>
              <Button
                variant="Emphasis"
                size="Medium"
                isDisabled={sendReplyState.replyContent.length === 0 || sendReplyState.isSending}
                isLoading={sendReplyState.isSending}
                onClick={onSendReply}
              >
                {translate("Action.SendReply")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MessageDetail;
