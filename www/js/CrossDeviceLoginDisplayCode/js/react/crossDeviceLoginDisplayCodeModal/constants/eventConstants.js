import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const CROSSDEVICEKEY = 'crossDeviceKey';

const events = {
  showModal: {
    name: 'showModal',
    type: eventTypes.pageLoad,
    context: CROSSDEVICEKEY
  },
  showProfile: {
    name: 'showProfile',
    type: eventTypes.pageLoad,
    context: 'confirmPrompt'
  }
};

export { events as default };
