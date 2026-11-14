import { useContext } from "react";
import {
  NotificationTemplateProps,
  NotificationLayoutType,
} from "../types/NotificationTemplateTypes";
import { SendrTemplateContext } from "../context/SendrTemplateContext";
import { getNotificationStreamHost } from "../../notificationStreamData/streamHost";

import FoundationNotificationTemplate from "./templates/FoundationNotificationTemplate";
import type { JSX } from "react";

export const NotificationView = (notificationProps: NotificationTemplateProps): JSX.Element => {
  const useFoundationTemplate = useContext(SendrTemplateContext);

  const { LegacyNotificationTemplate } = getNotificationStreamHost();
  let currentTemplate;
  if (useFoundationTemplate || !LegacyNotificationTemplate) {
    currentTemplate = FoundationNotificationTemplate;
  } else {
    switch (notificationProps.currentState.layoutKey) {
      case NotificationLayoutType.Default:
      default:
        currentTemplate = LegacyNotificationTemplate;
        break;
    }
  }

  const handleActions = notificationProps.isReadOnly ? undefined : notificationProps.handleActions;
  return currentTemplate({ ...notificationProps, handleActions });
};

export default NotificationView;
