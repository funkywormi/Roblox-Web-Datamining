const EVENT_CONSTANTS = {
  eventName: {
    authPageLoad: 'authPageload',
    authButtonClick: 'authButtonClick',
    authFormInteraction: 'authFormInteraction',
    authMsgShown: 'authMsgShown',
    authModalShown: 'authModalShown'
  },
  context: {
    settingsSpending: 'settingsSpending'
  },
  state: {
    spendingDisplayAllowPurchases: 'spendingDisplayAllowPurchases',
    spendingHideAllowPurchases: 'spendingHideAllowPurchases',
    paymentMethods: 'paymentMethods',
    allowPurchases: 'allowPurchases',
    spendLimit: 'spendLimit'
  },
  field: {
    askParentConfirm: 'askParentConfirm',
    cancelModal: 'cancelModal'
  },
  btn: {
    askParentTexas: 'askParentTexas',
    askParent: 'askParent',
    askParentConfirm: 'askParentConfirm',
    cancelAskParentConfirm: 'cancelAskParentConfirm',
    cancelRequest: 'cancelRequest',
    doNotCancelRequest: 'doNotCancelRequest',
    cancel: 'cancel'
  },
  text: {
    paymentMethods: 'Payment methods',
    spending: 'Spending',
    askMyParent: 'Ask My Parent',
    askYourParent: 'Ask your parent',
    askNow: 'Ask now',
    cancel: 'Cancel',
    cancelRequest: 'Cancel request',
    cancelRequestCapitalized: 'Cancel Request',
    doNotCancel: 'Do Not Cancel'
  }
};

export default EVENT_CONSTANTS;
