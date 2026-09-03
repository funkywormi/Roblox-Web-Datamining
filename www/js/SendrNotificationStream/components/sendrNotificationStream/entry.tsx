import "./src/main.css";
import "./src/sendrNotificationStream.scss";

import {
  renderSendrNotification,
  renderSendrModalContainer,
} from "@rbx/notifications/sendrNotificationStream/utils/notificationReactMountUtility";
import { renderGroupMembershipNotification } from "@rbx/notifications/notificationStreamCards/groupMembership/renderGroupMembershipNotification";
import { renderPrivateMessageNotification } from "@rbx/notifications/notificationStreamCards/privateMessage/renderPrivateMessageNotification";
import { renderGameUpdateNotification } from "@rbx/notifications/notificationStreamCards/gameUpdate/renderGameUpdateNotification";
import { renderTestNotification } from "@rbx/notifications/notificationStreamCards/test/renderTestNotification";

Object.assign(Roblox, {
  NotificationStreamService: {
    renderSendrNotification,
    renderSendrModalContainer,
    renderGroupMembershipNotification,
    renderPrivateMessageNotification,
    renderGameUpdateNotification,
    renderTestNotification,
  },
});
