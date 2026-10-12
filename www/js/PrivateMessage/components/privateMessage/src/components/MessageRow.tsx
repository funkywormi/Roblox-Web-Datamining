import classNames from "classnames";
import { Checkbox } from "@rbx/foundation-ui";
import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import { MESSAGE_TABS, PREVIEW_SEPARATOR, ROBLOX_USER, USER_HANDLE_PREFIX } from "../constants";
import { htmlToPlainText } from "../utils/messageUtils";
import type { FormatDate, MessageItem, MessageTab, RenderThumbnail, Translate } from "../types";
import ClickBoundary from "./ClickBoundary";
import SystemRobloxLogo from "./SystemRobloxLogo";

const UserName = ({
  translate,
  message,
  activeTab,
  isUnread,
}: {
  translate: Translate;
  message: MessageItem;
  activeTab: MessageTab;
  isUnread: boolean;
}) => {
  const user = activeTab === MESSAGE_TABS.sent ? message.recipient : message.sender;
  return (
    <span className="flex items-center gap-xsmall text-truncate-end">
      <span
        className={classNames(
          "text-truncate-end text-title-large",
          isUnread ? "content-emphasis" : "content-muted",
        )}
      >
        {user.displayName}
      </span>
      {user.hasVerifiedBadge ? (
        <VerifiedBadgeIcon
          size="Medium"
          titleText={translate("Creator.VerifiedBadgeIconAccessibilityText")}
        />
      ) : null}
      <span className="text-truncate-end text-body-medium content-muted">
        {USER_HANDLE_PREFIX}
        {user.name}
      </span>
    </span>
  );
};

const MessageAvatar = ({
  message,
  activeTab,
  renderThumbnail,
  onOpen,
}: {
  message: MessageItem;
  activeTab: MessageTab;
  renderThumbnail: RenderThumbnail;
  onOpen: () => void;
}) => {
  const user = activeTab === MESSAGE_TABS.sent ? message.recipient : message.sender;
  const isRobloxSystemUser =
    activeTab !== MESSAGE_TABS.sent && message.sender.id === ROBLOX_USER.id;

  return (
    <button
      type="button"
      className="private-message-row-avatar bg-none stroke-none padding-none width-full size-800 flex items-center justify-center"
      onClick={onOpen}
      aria-label={user.displayName}
    >
      {isRobloxSystemUser ? (
        <SystemRobloxLogo className="size-700" />
      ) : (
        <span className="radius-circle clip size-700">
          {renderThumbnail({ userId: user.id, altName: user.displayName })}
        </span>
      )}
    </button>
  );
};

const MessageRow = ({
  translate,
  renderThumbnail,
  formatListDate,
  message,
  index,
  activeTab,
  isSelected,
  isSelectable,
  onToggleSelection,
  onOpen,
}: {
  translate: Translate;
  renderThumbnail: RenderThumbnail;
  formatListDate: FormatDate;
  message: MessageItem;
  index: number;
  activeTab: MessageTab;
  isSelected: boolean;
  isSelectable: boolean;
  onToggleSelection: (messageId: number) => void;
  onOpen: (message: MessageItem, index: number) => void;
}): React.ReactElement => {
  const handleOpen = () => {
    onOpen(message, index);
  };

  const isUnread = !message.isRead && activeTab !== MESSAGE_TABS.sent;

  return (
    <div
      className={classNames(
        "private-message-row grid items-center gap-medium padding-large stroke-bottom stroke-muted transition-colors",
        isUnread ? "bg-surface-200 hover:bg-surface-300" : "bg-surface-100 hover:bg-surface-300",
      )}
    >
      <ClickBoundary className={classNames(!isSelectable && "invisible")}>
        <Checkbox
          aria-label={message.subject}
          size="Medium"
          placement="Start"
          isChecked={isSelected}
          onCheckedChange={() => {
            onToggleSelection(message.id);
          }}
        />
      </ClickBoundary>
      <MessageAvatar
        message={message}
        activeTab={activeTab}
        renderThumbnail={renderThumbnail}
        onOpen={handleOpen}
      />
      <button
        type="button"
        className="bg-none stroke-none padding-none flex flex-col gap-y-small"
        onClick={handleOpen}
        aria-label={message.subject}
      >
        <div className="flex items-center justify-between gap-small text-no-wrap">
          <UserName
            translate={translate}
            message={message}
            activeTab={activeTab}
            isUnread={isUnread}
          />
          <span className="text-caption-medium content-muted">
            {formatListDate(message.created)}
          </span>
        </div>
        <div className="flex text-no-wrap">
          <span className="text-truncate-end text-body-large content-muted">
            <span className={isUnread ? "content-emphasis" : "content-muted"}>
              {message.subject}
            </span>
            {PREVIEW_SEPARATOR}
            {htmlToPlainText(message.body)}
          </span>
        </div>
      </button>
    </div>
  );
};

export default MessageRow;
