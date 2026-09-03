import createGroupModule from '../createGroupModule';

function translationService(languageResource) {
  'ngInject';

  const translatedResources = {
    errorMessages: {
      unknown: languageResource.get('Message.UnknownError'),
      invalidMembership: languageResource.get('Message.InvalidMembership'),
      tooManyGroups: languageResource.get('Message.TooManyGroups'),
      insufficientRobux: languageResource.get('Message.InsufficientRobux'),
      nameInvalid: languageResource.get('Message.NameInvalid'),
      nameModerated: languageResource.get('Message.NameModerated'),
      groupIconInvalid: languageResource.get('Message.GroupIconInvalid'),
      groupIconTooLarge: languageResource.get('Message.GroupIconTooLarge'),
      groupCoverPhotoMissing: languageResource.get('Message.GroupCoverPhotoMissing'),
      groupCoverPhotoInvalid: languageResource.get('Message.GroupCoverPhotoInvalid'),
      tooManyRequests: languageResource.get('Message.TooManyRequests'), // Image upload is the only thing that will flood group creation right now.
      duplicateName: languageResource.get('Message.DuplicateName'),
      featureDisabled: languageResource.get('Message.FeatureDisabled'),
      nameTooLong: languageResource.get('Message.NameTooLong'),
      descriptionTooLong: languageResource.get('Message.DescriptionTooLong')
    }
  };

  return {
    getTextResources() {
      return translatedResources;
    }
  };
}

createGroupModule.factory('translationService', translationService);

export default translationService;
