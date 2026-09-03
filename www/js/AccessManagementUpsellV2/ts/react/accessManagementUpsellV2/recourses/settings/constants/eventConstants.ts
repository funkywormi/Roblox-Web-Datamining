export enum EventType {
  ModalShown = 'ModalShown',
  Confirm = 'Confirm',
  Cancel = 'Cancel',
  CloseModal = 'CloseModal'
}

const authEventNames = {
  authPageload: 'authPageload',
  authButtonClick: 'authButtonClick',
  authFormInteraction: 'authFormInteraction',
  authMsgShown: 'authMsgShown',
  authModalShown: 'authModalShown'
};

export const getPhoneDiscoverabilityConsentEventParams = {
  discoverabilityModalShown: (context: string) => ({
    name: authEventNames.authModalShown,
    context,
    params: {
      field: 'phoneDiscoverability',
      associatedText: 'Turn on friend discovery'
    }
  }),
  confirmDiscoverability: (context: string) => ({
    name: authEventNames.authButtonClick,
    context,
    params: {
      btn: 'phoneDiscoverabilityConfirm',
      associatedText: 'Turn on'
    }
  }),
  cancelDiscoverability: (context: string) => ({
    name: authEventNames.authButtonClick,
    context,
    params: {
      btn: 'phoneDiscoverabilityNotNow',
      associatedText: 'Not now'
    }
  }),
  closeModal: (context: string) => ({
    name: authEventNames.authButtonClick,
    context,
    params: {
      btn: 'phoneDiscoverabilityClose',
      associatedText: 'X'
    }
  })
};
