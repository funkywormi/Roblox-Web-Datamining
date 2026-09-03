import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const QUICK_LOGIN = 'quickLogin';
const APPROVE_QUICK_LOGIN = 'approveQuickLogin';

const events = {
  pageLoad: {
    name: 'pageLoad',
    type: eventTypes.pageLoad,
    context: QUICK_LOGIN,
    params: {}
  },
  buttonClick: {
    name: 'buttonClick',
    type: 'buttonClick',
    context: QUICK_LOGIN,
    params: {
      btn: 'enterDeviceCode'
    }
  },
  approvedPageLoad: {
    name: 'approvedPageLoad',
    type: eventTypes.pageLoad,
    context: APPROVE_QUICK_LOGIN,
    params: {}
  },
  approvedButtonClick: {
    name: 'approvedButtonClick',
    type: 'buttonClick',
    context: APPROVE_QUICK_LOGIN,
    params: {
      btn: 'grantAccess'
    }
  },
  quickLoginFailed: {
    name: 'quickLoginFailed',
    type: eventTypes.pageLoad,
    context: 'quickLoginFailed'
  },
  quickLoginSucceeded: {
    name: 'quickLoginSucceeded',
    type: eventTypes.pageLoad,
    context: 'quickLoginSucceeded'
  }
};

export { events as default };
