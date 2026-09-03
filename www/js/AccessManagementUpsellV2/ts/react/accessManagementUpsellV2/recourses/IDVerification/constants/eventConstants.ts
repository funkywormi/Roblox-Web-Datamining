const FAEEventConstants = {
  eventName: {
    authPageLoad: 'authPageload',
    authButtonClick: 'authButtonClick',
    authFormInteraction: 'authFormInteraction',
    authMsgShown: 'authMsgShown',
    authModalShown: 'authModalShown'
  },
  state: {
    sessionId: 'sessionId'
  },
  field: {
    webEmbededFaeStart: 'webEmbededFaeStart',
    webEmbededFaeError: 'webEmbededFaeError',
    webEmbededFaeCancel: 'webEmbededFaeCancel',
    webFaeStatus: 'webFaeStatus',
    webHostedFaeStart: 'webHostedFaeStart',
    webQrCodeFaeStart: 'webQrCodeFaeStart',
    webQrCodeFaeComplete: 'webQrCodeFaeComplete',
    webQrCodeFaeTimeout: 'webQrCodeFaeTimeout',
    webQrCodeFaeClose: 'webQrCodeFaeClose'
  },
  btn: {
    cancelFae: 'cancelFae'
  },
  text: {}
};

export default FAEEventConstants;
