import { recordGet } from "@rbx/core-lib";
import { Link } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber, truncNumber } from "@rbx/core-scripts/format/number";
import dataStores from "@rbx/core-scripts/data-store";
import links from "../../constants/linkConstants";

const { maxFriendRequestNotificationCount } = dataStores.userDataStore;
const { maxMessagesNotificationCount } = dataStores.userDataStore;

function formatNotification(name: string, count: number) {
  if (name === links.scrollListItems.friends.name && count >= maxFriendRequestNotificationCount) {
    return `${maxFriendRequestNotificationCount}+`;
  }
  if (name === links.scrollListItems.messages.name && count >= maxMessagesNotificationCount) {
    return `${maxMessagesNotificationCount}+`;
  }
  return truncNumber(count, 1000);
}

export default function LeftNavItem({
  idSelector = "",
  isModal = false,
  name,
  iconClass,
  labelTranslationKey,
  url = "",
  urlForNotification = "",
  onClickShopLink,
  blankTarget = false,
  friendsData,
  messagesData,
  tradeData,
}: {
  idSelector?: string;
  isModal?: boolean;
  name: string;
  iconClass: string;
  labelTranslationKey: string;
  url?: string;
  urlForNotification?: string;
  onClickShopLink: () => void;
  blankTarget?: boolean;
  friendsData: { count?: number };
  messagesData: { count?: number };
  tradeData: { count: number };
}) {
  const { translate } = useTranslation();
  const notificationItems = {
    [links.scrollListItems.friends.name]: friendsData,
    [links.scrollListItems.messages.name]: messagesData,
    [links.scrollListItems.trade.name]: tradeData,
  } as const;

  const notificationItem = recordGet(notificationItems, name);

  const hrefUrl = notificationItem?.count ? urlForNotification : url;

  const target = blankTarget ? "_blank" : "_self";

  if (isModal)
    return (
      <li key={name}>
        <button
          id={idSelector}
          type="button"
          onClick={onClickShopLink}
          className="dynamic-overflow-container text-nav"
        >
          <div>
            <span className={iconClass} />
          </div>
          <span
            className="font-header-2 dynamic-ellipsis-item"
            title={translate(labelTranslationKey)}
          >
            {translate(labelTranslationKey)}
          </span>
        </button>
      </li>
    );
  return (
    <li key={name}>
      <Link
        url={hrefUrl}
        id={idSelector}
        className="dynamic-overflow-container text-nav"
        target={target}
      >
        <div>
          <span className={iconClass} />
        </div>
        <span
          className="font-header-2 dynamic-ellipsis-item"
          title={translate(labelTranslationKey)}
        >
          {translate(labelTranslationKey)}
        </span>
        {notificationItem?.count != null && notificationItem.count > 0 && (
          <div className="dynamic-width-item align-right">
            <span
              className="notification-blue notification"
              title={formatNumber(notificationItem.count)}
            >
              {formatNotification(name, notificationItem.count)}
            </span>
          </div>
        )}
      </Link>
    </li>
  );
}
