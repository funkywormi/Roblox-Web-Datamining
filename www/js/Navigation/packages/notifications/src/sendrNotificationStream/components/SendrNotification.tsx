import { useRef, useState } from "react";
import { DeepLinkService } from "Roblox";
import {
  sendEventStreamEvent,
  updateNotificationAction,
} from "../services/NotificationStreamService";
import { executeClientTrigger } from "../clientTriggers/executeClientTrigger";
import {
  Action,
  ActionType,
  InteractibleVisualItem,
  NotificationContent,
  NotificationTemplateProps,
  SendrNotificationProps,
  VisualItemType,
} from "../types/NotificationTemplateTypes";
import DeeplinkFailModal from "./DeeplinkFailModal";
import eventConstants from "../constants/eventConstants";
import {
  deepLinkNavigationPaths,
  deepLinkNavigationPathPart,
} from "../constants/deepLinkConstants";

import NotificationView from "./NotificationView";
import { reportNotificationStreamError } from "../../notificationStreamData/notificationStreamObservability";

export const handleUpdateNotificationAction = async (
  streamId: string,
  actionId: string,
  updateNotificationContent: (newContent: NotificationContent) => void,
): Promise<boolean> =>
  updateNotificationAction(streamId, actionId).then(
    (response: any) => {
      if (response.data.content) {
        updateNotificationContent(response.data.content);
      }
      return response.status === 200;
    },
    () => false,
  );

const getFirstDeepLinkNavigationPath = (path: string | undefined): string | undefined => {
  if (!path) {
    return undefined;
  }
  const parsedPath = DeepLinkService.parseDeeplink(path);
  if (parsedPath.path[0] === deepLinkNavigationPathPart) {
    return parsedPath.path[1];
  }
  return undefined;
};

const shouldRetryDeeplink = (action: Action): boolean => {
  const firstDeepLinkNavigationPath = getFirstDeepLinkNavigationPath(action.path);
  return firstDeepLinkNavigationPath !== deepLinkNavigationPaths.Fae;
};

const shouldDeeplinkFailShowModal = (action: Action): boolean => {
  const firstDeepLinkNavigationPath = getFirstDeepLinkNavigationPath(action.path);
  return firstDeepLinkNavigationPath !== deepLinkNavigationPaths.Fae;
};

export const SendrNotification = ({
  notificationData,
  onRemoved,
  onActionFailed,
}: SendrNotificationProps): JSX.Element => {
  const eventTime: string = notificationData.eventDate;

  const [content, setContent] = useState(notificationData.content);
  const [currentState, setCurrentState] = useState(content.currentState);
  const [dismissed, setDismissed] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [showDeeplinkFailureModal, setShowDeeplinkFailureModal] = useState(false);
  const handlingActionsRef = useRef(false);

  const updateNotificationContent = (newContent: NotificationContent): void => {
    setContent(newContent);
    setCurrentState(newContent.currentState);
  };

  const handleEventStreamClickEvent = (
    eventName: string,
    visualItemType: VisualItemType,
    params?: Record<string, string>,
    visualItemName?: string,
    bundlePosition?: number,
    bundleId?: string,
  ) => {
    sendEventStreamEvent(eventName, "click", {
      ...params,
      sendrVersion: content.minVersion.toString(),
      notifType: content.notificationType,
      notifId: notificationData.id,
      visual_item_type: visualItemType,
      visual_item_name: visualItemName == null ? "" : visualItemName,
      bundlePosition: bundlePosition?.toString() ?? "",
      bundleId: bundleId ?? "",
    });
  };

  const runActions = async (visualItem: InteractibleVisualItem) => {
    if (visualItem.eventName) {
      handleEventStreamClickEvent(
        visualItem.eventName,
        visualItem.visualItemType,
        visualItem.clientEventsPayload,
        visualItem.visualItemName,
        notificationData.bundleIndex,
        notificationData.bundleId,
      );
    }

    const actions = visualItem.actions ?? [];
    for (const action of actions) {
      let canContinue = true;
      let isSuccess = true;
      const senderId = notificationData.content?.clientEventsPayload?.sender_userid;

      switch (action.actionType) {
        case ActionType.Dismiss:
          setDismissed(true);
          break;
        case ActionType.Deeplink:
          if (action!.path) {
            DeepLinkService.navigateToDeepLink(action!.path).then(
              success => {
                if (!success && shouldRetryDeeplink(action!)) {
                  // Possibly a network failure on game join, retry once after a
                  // short delay
                  setTimeout(() => {
                    if (action!.path) {
                      DeepLinkService.navigateToDeepLink(action!.path).then(
                        retrySuccess => {
                          if (!retrySuccess) {
                            setShowDeeplinkFailureModal(true);
                          }
                        },
                        () => setShowDeeplinkFailureModal(true),
                      );
                    }
                  }, 2000);
                }
              },
              () => {
                if (shouldDeeplinkFailShowModal(action!)) {
                  setShowDeeplinkFailureModal(true);
                }
              },
            );
          }
          break;
        case ActionType.NotificationAPI:
          if (action!.path) {
            // We need to await this call so we can stop iteration if it fails
            // eslint-disable-next-line no-await-in-loop
            const actionSuccess: boolean = await handleUpdateNotificationAction(
              notificationData.id,
              action!.path,
              updateNotificationContent,
            );
            if (!actionSuccess) {
              if (action!.fallbackState) {
                setCurrentState(action!.fallbackState);
              }
              canContinue = false;
              onActionFailed?.();
            }
          }
          break;
        case ActionType.ClientTrigger:
          if (!action.path) {
            canContinue = false;
            break;
          }
          // eslint-disable-next-line no-await-in-loop
          isSuccess = await executeClientTrigger(action.path, { senderId });
          break;
        default:
      }

      if (!canContinue || !isSuccess) {
        break;
      }

      if (action!.nextState) {
        setCurrentState(action!.nextState);
      }
    }
  };

  const handleActions = async (visualItem: InteractibleVisualItem) => {
    // Handle actions sequentially
    // If an action fails, stop processing and go to fallback state if provided
    // Blocks handling actions if an API call is in progress
    if (handlingActionsRef.current || !visualItem.actions) {
      return;
    }
    handlingActionsRef.current = true;
    try {
      await runActions(visualItem);
    } catch (error) {
      reportNotificationStreamError("sendrNotificationActions", error);
    } finally {
      handlingActionsRef.current = false;
    }
  };

  const state = content.states[currentState]!;

  const toggleMetaActions = () => {
    handleEventStreamClickEvent(
      eventConstants.OpenMetaActionsEvent,
      VisualItemType.MetaActionsButton,
      undefined,
      undefined,
      notificationData.bundleIndex,
    );
    const displayState: NotificationTemplateProps = {
      currentState: state,
      eventTime,
      handleActions,
      handleEventStreamClickEvent,
      toggleMetaActions,
    };
    const event = new CustomEvent("setMetaActionsList", {
      detail: {
        displayState,
        notificationData,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <div
      onTransitionEnd={e => {
        // Removes the notification once the slide-out has moved it out. Keyed off any
        // transition on this element rather than a property name, which the scss is free
        // to change; while dismissed the slide-out is the only transition it runs.
        if (!dismissed || removed || e.target !== e.currentTarget) {
          return;
        }
        setRemoved(true);
        onRemoved?.();
      }}
      className={`sendr-notification-background ${
        dismissed ? "sendr-notification-dismissed" : "sendr-notification-visible"
      }`}
    >
      <DeeplinkFailModal
        // TODO: Move DeeplinkFailModal out of this component into a high order
        // component that shares state across multiple notifications
        show={showDeeplinkFailureModal}
        closeCallback={() => setShowDeeplinkFailureModal(false)}
      />

      {!removed && state && (
        <NotificationView
          currentState={state}
          eventTime={eventTime}
          handleActions={handleActions}
          handleEventStreamClickEvent={handleEventStreamClickEvent}
          toggleMetaActions={toggleMetaActions}
          isReadOnly={notificationData.isReadOnly}
          notificationData={notificationData}
        />
      )}
    </div>
  );
};

export default SendrNotification;
