import { JSX } from "react";
import { NavLink } from "react-router-dom";
import { useFragment } from "react-relay";
import { useTranslation } from "@rbx/core-scripts/react";
import { SettingListItem } from "@rbx/user-settings";
import type { NotificationTypeListItemFragment$key } from "./__generated__/NotificationTypeListItemFragment.graphql";
import NotificationTypeListItemFragmentNode from "./__generated__/NotificationTypeListItemFragment.graphql";
import { buildSettingPath } from "../utils/routingUtils";
import {
  getEnabledNotificationChannels,
  resolveNotificationTypePresentation,
} from "../utils/presentationUtils";

export type NotificationTypeListItemProps = {
  categoryKey: string;
  notificationTypeRow: NotificationTypeListItemFragment$key;
};

/** One notification-type row (e.g. friend requests) with enabled-channel subtitle. */
export const NotificationTypeListItem = ({
  categoryKey,
  notificationTypeRow,
}: NotificationTypeListItemProps): JSX.Element => {
  const { translate } = useTranslation();
  const data = useFragment(NotificationTypeListItemFragmentNode, notificationTypeRow);
  const path = buildSettingPath(categoryKey, data.notificationType.value);

  const { titleTranslationKey } = resolveNotificationTypePresentation(data.notificationType.value);
  const description = getEnabledNotificationChannels(data.channels, translate);

  return (
    <NavLink to={path}>
      <SettingListItem
        id={path}
        title={translate(titleTranslationKey ?? "")}
        description={description || undefined}
        showArrow
      />
    </NavLink>
  );
};
