import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import { MESSAGE_TABS, ROBLOX_USER, USER_HANDLE_PREFIX } from "../constants";
import type { FormatDate, MessageItem, MessageTab, RenderThumbnail, Translate } from "../types";
import SystemRobloxLogo from "./SystemRobloxLogo";

const SenderAvatar = ({
  message,
  activeTab,
  renderThumbnail,
}: {
  message: MessageItem;
  activeTab: MessageTab;
  renderThumbnail: RenderThumbnail;
}): React.ReactElement => {
  const user = activeTab === MESSAGE_TABS.sent ? message.recipient : message.sender;
  const isRobloxSystemUser =
    activeTab !== MESSAGE_TABS.sent && message.sender.id === ROBLOX_USER.id;

  return (
    <a href={user.profileLink} className="size-800 shrink-0 flex items-center justify-center">
      {isRobloxSystemUser ? (
        <SystemRobloxLogo className="size-800" />
      ) : (
        <span className="radius-circle clip size-800">
          {renderThumbnail({ userId: user.id, altName: user.displayName })}
        </span>
      )}
    </a>
  );
};

const MessageDetail = ({
  translate,
  renderThumbnail,
  formatDetailDate,
  message,
  activeTab,
}: {
  translate: Translate;
  renderThumbnail: RenderThumbnail;
  formatDetailDate: FormatDate;
  message: MessageItem | null;
  activeTab: MessageTab;
}): React.ReactElement | null => {
  if (!message) {
    return null;
  }

  const user = activeTab === MESSAGE_TABS.sent ? message.recipient : message.sender;

  return (
    <div className="bg-surface-100 stroke-standard stroke-muted radius-medium padding-large">
      <div className="flex justify-between gap-medium">
        <div className="min-width-0">
          <h2 className="text-heading-medium content-emphasis margin-none text-wrap">
            {message.subject}
          </h2>
          <div className="flex gap-small margin-top-medium">
            <SenderAvatar
              message={message}
              activeTab={activeTab}
              renderThumbnail={renderThumbnail}
            />
            <div className="min-width-0 flex flex-col gap-y-small">
              <a
                href={user.profileLink}
                className="text-title-medium content-emphasis flex items-center gap-xsmall"
              >
                <span>{user.displayName}</span>
                {user.hasVerifiedBadge ? (
                  <VerifiedBadgeIcon
                    size="Medium"
                    titleText={translate("Creator.VerifiedBadgeIconAccessibilityText")}
                  />
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
    </div>
  );
};

export default MessageDetail;
