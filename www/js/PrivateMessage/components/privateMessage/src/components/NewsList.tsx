import { useState } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { BadgeSizes, VerifiedBadgeIconContainer } from "@rbx/roblox-badges";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { ROBLOX_USER, USER_HANDLE_PREFIX } from "../constants";
import { formatListDate } from "../utils/messageUtils";
import type { MessageItem, MessagePage } from "../types";
import SystemRobloxLogo from "./SystemRobloxLogo";

const NewsRow = ({ notification }: { notification: MessageItem }): React.ReactElement => {
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
            <span className="radius-small clip size-700">
              <Thumbnail2d
                targetId={notification.sender.id}
                type={ThumbnailTypes.avatarHeadshot}
                altName={notification.sender.displayName}
              />
            </span>
          )}
        </span>
        <span className="min-width-0 fill flex flex-col gap-y-small">
          <span className="flex justify-between gap-small">
            <span className="text-title-medium content-emphasis flex items-center gap-xsmall min-width-0">
              <span className="text-truncate-end">{notification.sender.displayName}</span>
              {notification.sender.hasVerifiedBadge ? (
                <VerifiedBadgeIconContainer size={BadgeSizes.CAPTIONHEADER} />
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

const NewsList = ({ page }: { page: MessagePage | null }): React.ReactElement => {
  const { translate } = useTranslation();
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
        <NewsRow key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NewsList;
