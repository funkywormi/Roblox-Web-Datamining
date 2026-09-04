import { useState } from "react";
import classNames from "classnames";
import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import { ROBLOX_USER, USER_HANDLE_PREFIX } from "../constants";
import type { FormatDate, MessageItem, MessagePage, RenderThumbnail, Translate } from "../types";
import SystemRobloxLogo from "./SystemRobloxLogo";

const NewsRow = ({
  translate,
  renderThumbnail,
  formatListDate,
  notification,
}: {
  translate: Translate;
  renderThumbnail: RenderThumbnail;
  formatListDate: FormatDate;
  notification: MessageItem;
}): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const isRobloxSystemUser = notification.sender.id === ROBLOX_USER.id;

  return (
    <button
      type="button"
      className={classNames(
        "width-full stroke-none stroke-bottom stroke-muted padding-medium text-left transition-colors",
        isOpen ? "bg-surface-200 hover:bg-surface-300" : "bg-surface-100 hover:bg-surface-300",
      )}
      onClick={() => {
        setIsOpen(previous => !previous);
      }}
      aria-expanded={isOpen}
      aria-label={notification.subject}
    >
      <div className="flex gap-small">
        <span className="size-700 shrink-0 flex items-center justify-center">
          {isRobloxSystemUser ? (
            <SystemRobloxLogo className="size-700" />
          ) : (
            <span className="radius-circle clip size-700">
              {renderThumbnail({
                userId: notification.sender.id,
                altName: notification.sender.displayName,
              })}
            </span>
          )}
        </span>
        <span className="min-width-0 fill flex flex-col gap-y-small">
          <span className="flex justify-between gap-small">
            <span className="text-title-medium content-emphasis flex items-center gap-xsmall min-width-0">
              <span className="text-truncate-end">{notification.sender.displayName}</span>
              {notification.sender.hasVerifiedBadge ? (
                <VerifiedBadgeIcon
                  size="Medium"
                  titleText={translate("Creator.VerifiedBadgeIconAccessibilityText")}
                />
              ) : null}
              <span className="text-body-medium content-muted">
                {USER_HANDLE_PREFIX}
                {notification.sender.name}
              </span>
            </span>
            <span className="text-caption-medium content-muted text-no-wrap">
              {formatListDate(notification.created)}
            </span>
          </span>
          <span className="private-message-row-preview text-body-large content-default">
            {notification.subject}
          </span>
          {isOpen ? (
            <span
              className="private-message-body block text-body-medium content-default margin-top-medium"
              // Announcement bodies are returned as trusted message content from the API.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: notification.body }}
            />
          ) : null}
        </span>
      </div>
    </button>
  );
};

const NewsList = ({
  translate,
  renderThumbnail,
  formatListDate,
  page,
}: {
  translate: Translate;
  renderThumbnail: RenderThumbnail;
  formatListDate: FormatDate;
  page: MessagePage | null;
}): React.ReactElement => {
  const notifications = page?.collection ?? [];

  if (notifications.length === 0) {
    return (
      <div className="bg-surface-100 stroke-standard stroke-muted radius-medium padding-large text-body-medium content-muted text-center">
        {translate("Message.NoNews")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden radius-medium stroke-standard stroke-muted">
      {notifications.map(notification => (
        <NewsRow
          key={notification.id}
          translate={translate}
          renderThumbnail={renderThumbnail}
          formatListDate={formatListDate}
          notification={notification}
        />
      ))}
    </div>
  );
};

export default NewsList;
