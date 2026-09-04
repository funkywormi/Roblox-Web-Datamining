import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const contextName = 'forgotPasswordPrompt';
const buttonClickType = 'buttonClick';

const events = {
  modalShown: {
    name: 'modalShown',
    type: eventTypes.modalAction,
    context: contextName,
    params: {
      aType: 'shown'
    }
  },
  yesButtonClick: {
    name: 'yesButtonClick',
    type: buttonClickType,
    context: contextName,
    params: {
      btn: 'yes'
    }
  },
  noButtonClick: {
    name: 'noButtonClick',
    type: buttonClickType,
    context: contextName,
    params: {
      btn: 'no'
    }
  }
};

export { events as default };
