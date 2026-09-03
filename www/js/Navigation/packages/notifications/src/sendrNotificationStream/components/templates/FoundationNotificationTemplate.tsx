import React from "react";
import { Button, Notification } from "@rbx/foundation-ui";
import { getRelativeTimeMaxDays } from "../../../utils/relativeTime";
import {
  ButtonStyle,
  NotificationTemplateProps,
  VisualItemButton,
  VisualItemMetaAction,
  VisualItemText,
  VisualItemThumbnail,
  VisualItemType,
} from "../../types/NotificationTemplateTypes";
import FoundationSendrMedia from "../FoundationSendrMedia";
import FoundationSendrKebab from "../FoundationSendrKebab";
import isVisualItemAbuseReport from "../../utils/isVisualItemAbuseReport";
import { formatText } from "../../utils/labelUtils";
import { openNotificationStreamAbuseReport } from "../../utils/notificationStreamWindowHost";
import eventConstants from "../../constants/eventConstants";

const buttonStyleClass: Record<ButtonStyle, string> = {
  [ButtonStyle.Primary]: "sendr-notification-button--primary",
  [ButtonStyle.Secondary]: "sendr-notification-button--secondary",
  [ButtonStyle.Growth]: "sendr-notification-button--growth",
  [ButtonStyle.Alert]: "sendr-notification-button--alert",
};

export const FoundationNotificationTemplate = ({
  currentState,
  eventTime,
  handleActions,
  handleEventStreamClickEvent,
  isReadOnly,
  notificationData,
}: NotificationTemplateProps): JSX.Element => {
  const { visualItems } = currentState;
  const thumbnailItem: VisualItemThumbnail | undefined = visualItems[VisualItemType.Thumbnail]?.[0];
  const textBody: VisualItemText | undefined = visualItems[VisualItemType.TextBody]?.[0];
  const buttons: Array<VisualItemButton> = visualItems[VisualItemType.Button] ?? [];
  const metaActions: Array<VisualItemMetaAction> = visualItems[VisualItemType.MetaAction] ?? [];

  const eventTimeString = eventTime
    ? getRelativeTimeMaxDays(new Date(eventTime), new Date())
    : undefined;

  const showKebab = metaActions.length > 0 && !isReadOnly;
  const showButtons = buttons.length > 0 && !isReadOnly;
  const cardClickable = Boolean(textBody?.actions?.length) && !isReadOnly && Boolean(handleActions);

  const onMetaSelect = (action: VisualItemMetaAction): void => {
    if (isVisualItemAbuseReport(action) && notificationData) {
      handleEventStreamClickEvent(
        eventConstants.ReportNotificationOpen,
        action.visualItemType,
        action.clientEventsPayload,
        action.visualItemName,
        notificationData.bundleIndex,
        notificationData.bundleId,
      );
      openNotificationStreamAbuseReport(notificationData);
    } else if (handleActions) {
      handleActions(action);
    }
  };

  const kebab = showKebab ? (
    <FoundationSendrKebab
      actions={metaActions}
      onSelect={onMetaSelect}
      ariaLabel="Notification options"
    />
  ) : null;

  const actionButton = (button: VisualItemButton): JSX.Element => (
    <Button
      className={`fill basis-0 sendr-notification-button ${buttonStyleClass[button.buttonStyle]}`}
      variant="Standard"
      size="Small"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        handleActions?.(button);
      }}
    >
      {button.label.text}
    </Button>
  );

  // The card carries two action slots, so a payload with a third button would drop it.
  const [firstButton, secondButton] = showButtons ? buttons : [];

  return (
    <Notification
      className="notification-card-tight"
      style={{ textAlign: "left", cursor: cardClickable ? "pointer" : undefined }}
      media={thumbnailItem ? <FoundationSendrMedia thumbnailItem={thumbnailItem} /> : undefined}
      title={
        textBody?.title ? <React.Fragment>{formatText(textBody.title)}</React.Fragment> : undefined
      }
      description={textBody?.label ? formatText(textBody.label) : undefined}
      trailingAction={kebab}
      primaryAction={firstButton ? actionButton(firstButton) : undefined}
      secondaryAction={secondButton ? actionButton(secondButton) : undefined}
      timestamp={eventTimeString}
      onClick={cardClickable && textBody ? () => handleActions?.(textBody) : undefined}
    />
  );
};

export default FoundationNotificationTemplate;
