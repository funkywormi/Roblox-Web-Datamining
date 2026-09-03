import { useContext } from "react";
import {
  NotificationTemplateProps,
  NotificationLayoutType,
} from "../types/NotificationTemplateTypes";
import { SendrTemplateContext } from "../context/SendrTemplateContext";

import LegacyNotificationTemplate from "./templates/LegacyNotificationTemplate";
import FoundationNotificationTemplate from "./templates/FoundationNotificationTemplate";

export const NotificationView = (notificationProps: NotificationTemplateProps): JSX.Element => {
  const useFoundationTemplate = useContext(SendrTemplateContext);

  let currentTemplate;
  if (useFoundationTemplate) {
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
