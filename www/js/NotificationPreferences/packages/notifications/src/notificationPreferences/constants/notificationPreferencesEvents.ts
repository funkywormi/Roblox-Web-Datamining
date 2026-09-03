import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const CONTEXT = 'NotificationPreferences';

const events = {
  NotificationPreferencesOrigin: 'NotificationPreferences',

  pageLoaded: {
    name: 'pageLoaded',
    context: CONTEXT,
    type: eventTypes.pageLoad,
    params: {}
  },
  enableNotificationsPromptShown: {
    name: 'enableNotificationsPromptShown',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'enableMobilePushNotifications',
      aType: 'shown'
    }
  },
  enableNotificationsPromptClicked: {
    name: 'enableNotificationsPromptClicked',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'enableMobilePushNotifications',
      aType: 'click'
    }
  },
  categoryToggle: {
    name: 'categoryToggle',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'toggleCategoryShown',
      aType: 'click'
    }
  },
  sendAll: {
    name: 'sendAll',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'sendAll',
      aType: 'click'
    }
  },
  sendBest: {
    name: 'sendBest',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'sendBest',
      aType: 'click'
    }
  },
  sendNone: {
    name: 'sendNone',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'sendNone',
      aType: 'click'
    }
  },
  promptUnsubscribe: {
    name: 'promptUnsubscribe',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'promptUnsubscribe',
      aType: 'click'
    }
  },
  unsubscribeFromExperience: {
    name: 'unsubscribeFromExperience',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'unsubscribeFromExperience',
      aType: 'click'
    }
  },
  cancelUnsubscribe: {
    name: 'cancelUnsubscribe',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      btn: 'cancelUnsubscribe',
      aType: 'click'
    }
  }
};

export { events as default };
