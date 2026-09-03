import { JSX } from "react";
import type { CategoryPageFragment$data } from "./__generated__/CategoryPageFragment.graphql";
import { NotificationTypeListItem } from "./NotificationTypeListItem";

type NotificationTypePageListProps = {
  categoryKey: string;
  notificationTypes: CategoryPageFragment$data["notificationTypes"];
};

export const NotificationTypePageList = ({
  categoryKey,
  notificationTypes,
}: NotificationTypePageListProps): JSX.Element => (
  <nav>
    {notificationTypes.map(nt => (
      <NotificationTypeListItem
        key={nt.notificationType.value}
        categoryKey={categoryKey}
        notificationTypeRow={nt}
      />
    ))}
  </nav>
);
