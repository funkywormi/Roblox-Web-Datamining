import { CurrentUser, EventStream } from 'Roblox';
import chatModule from '../chatModule';

function analyticsService(
  $log,
  chatUtility,
  featureInterventionAnalytics,
  diagActionList,
  eventNames
) {
  'ngInject';

  const { EventTracker } = window;

  const sendEvent = function (eventName, eventProperties) {
    if (!EventStream) {
      return;
    }
    EventStream.SendEventWithTarget(
      eventName,
      'WebChatEventContext', // Context; not currently used
      eventProperties,
      EventStream.TargetTypes.WWW
    );
  };
  const incrementCounter = function (counterName) {
    if (!EventTracker) {
      return;
    }
    EventTracker.fireEvent(counterName);
  };

  const convertSnakeToCamel = function (str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  };
  // Keep the `modalSequence` emitted in-line with what the Lua client emits
  const eventStreamModalSequenceMap = {
    [chatUtility.modalSequence.CONVERSATION_LIST_OVERLAY]: 'ConversationListOverlay'
  };
  const translateModalEventPropertiesForEventStream = function (eventProperties) {
    const { modalSequence, modalVariant } = eventProperties;
    return {
      ...eventProperties,
      modalSequence: eventStreamModalSequenceMap[modalSequence] || 'Unknown',
      modalVariant: modalVariant || 'Unknown'
    };
  };
  /**
   * Formats the counter prefix in the following order, split by underscores, enabling easy sorting and regex matching:
   * 1. Surface, in order of general -> specific (Modal prefix -> modal sequence -> modal variant)
   * 2. Action taken,
   * 3. Action details, if any
   * Example: WebChatModal_conversationListOverlay_osaContextCard_action_primaryCta
   */
  const formatModalCounterPrefix = function (
    modalSequence,
    modalVariant,
    actionTaken,
    actionDetails = []
  ) {
    // since each part of the resulting name is split by underscore,
    // convert from snake_case to remove underscores in the individual parts that are snake case
    const camelCaseModalSequence = convertSnakeToCamel(modalSequence);
    const camelCaseModalVariant = convertSnakeToCamel(modalVariant);
    const counterNameParts = [
      diagActionList.ModalPrefix,
      camelCaseModalSequence,
      camelCaseModalVariant,
      actionTaken,
      ...actionDetails
    ];
    return counterNameParts.join('_');
  };

  return {
    sendEvent,
    incrementCounter,
    getConversationIdForAnalytics(conversation) {
      if (conversation?.dialogType === chatUtility.dialogType.FRIEND) {
        // keep sync with getFriendId in lua-apps channels conversation model
        const conversationId = conversation.id || 'unknown-id';
        return `friends:${conversationId}`;
      }

      return conversation?.id;
    },
    sendInterventionEvent({
      eventType,
      interventionType,
      renderedTimestamp,
      eventId,
      durationSeconds
    }) {
      if (!EventStream) {
        return;
      }
      const userId = parseInt(CurrentUser.userId);
      const interactedTimestamp = Date.now();

      const eventProperties = {
        user_id: userId,
        timestamp_milliseconds: interactedTimestamp,
        event_type: eventType,
        interventionType,
        event_id: eventId,
        timeout_duration_seconds: durationSeconds,
        placement: 'Web'
      };
      if (
        eventType === featureInterventionAnalytics.eventTypes.appealClicked ||
        eventType === featureInterventionAnalytics.eventTypes.ctaClicked ||
        eventType === featureInterventionAnalytics.eventTypes.learnClicked
      ) {
        eventProperties.time_to_interact_seconds = (interactedTimestamp - renderedTimestamp) / 1000;
      }

      EventStream.SendEventWithTarget(
        featureInterventionAnalytics.eventName,
        featureInterventionAnalytics.eventContext,
        eventProperties,
        EventStream.TargetTypes.WWW
      );
    },
    sendModalRenderedEvent(eventProperties) {
      const { modalSequence, modalVariant } = eventProperties;
      if (!modalSequence || !modalVariant) {
        $log.debug('sendModalRenderedEvent: modalSequence or modalVariant is missing');
      }

      sendEvent(
        eventNames.webChatModalRendered,
        translateModalEventPropertiesForEventStream(eventProperties)
      );
      incrementCounter(formatModalCounterPrefix(modalSequence, modalVariant, 'rendered'));
    },
    sendModalActionEvent(eventProperties) {
      const { modalSequence, modalVariant, action } = eventProperties;
      if (!modalSequence || !modalVariant || !action) {
        $log.debug('sendModalActionEvent: modalSequence, modalVariant or action is missing');
      }

      sendEvent(
        eventNames.webChatModalAction,
        translateModalEventPropertiesForEventStream(eventProperties)
      );
      incrementCounter(formatModalCounterPrefix(modalSequence, modalVariant, 'action', [action]));
    },
    sendModalActionResultEvent(eventProperties) {
      const { modalSequence, modalVariant, action, actionResult } = eventProperties;
      if (!modalSequence || !modalVariant || !action || !actionResult) {
        $log.debug(
          'sendModalActionResultEvent: modalSequence, modalVariant, action, or actionResult is missing'
        );
      }

      sendEvent(
        eventNames.webChatModalActionResult,
        translateModalEventPropertiesForEventStream(eventProperties)
      );
      incrementCounter(
        formatModalCounterPrefix(modalSequence, modalVariant, 'actionResult', [
          action,
          actionResult
        ])
      );
    },
    modalActionType: {
      PRIMARY_CTA: 'primaryCta',
      SECONDARY_CTA: 'secondaryCta',
      DISMISS: 'dismiss'
    },
    modalActionResultType: {
      SUCCESS: 'success',
      FAILURE: 'failure'
    }
  };
}

chatModule.factory('analyticsService', analyticsService);

export default analyticsService;
