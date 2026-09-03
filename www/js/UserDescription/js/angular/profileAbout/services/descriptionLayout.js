import profileAboutModule from '../profileAboutModule';

function descriptionLayout($log, languageResource) {
  'ngInject';

  const lang = languageResource;

  return {
    descriptionLayout: {
    },

    getDescriptionResponse: {
      errorCodeMapMsg: {
        1: lang.get('Description.Error'),
        2: lang.get('Message.PinLocked')
      }
    }
  };
}

profileAboutModule.factory('descriptionLayout', descriptionLayout);

export default descriptionLayout;