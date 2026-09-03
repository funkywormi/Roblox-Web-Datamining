import createGroupModule from '../createGroupModule';

function createGroupPageController(
  $window,
  $filter,
  $log,
  languageResource,
  createGroupConstants,
  createGroupService,
  groupsConstants,
  $uibModal,
  systemFeedbackService,
  translationService,
  groupsService,
  groupUtilityService
) {
  'ngInject';

  const ctrl = this;

  ctrl.purchaseButtonClicked = function () {
    if (ctrl.creationInProgress) {
      return;
    }

    $uibModal
      .open({
        animation: false,
        component: 'createGroupConfirmationModal',
        resolve: {
          metadata: ctrl.metadata.groupConfiguration
        }
      })
      .result.then(
        function () {
          if (ctrl.creationInProgress) {
            return;
          }
          ctrl.creationInProgress = true;

          createGroupService
            .createGroup(
              ctrl.createGroupRequest.name,
              ctrl.createGroupRequest.description,
              ctrl.iconUploadInfo.file,
              ctrl.coverPhotoUploadInfo.file,
              ctrl.createGroupRequest.isGroupPublic !== 'false',
              ctrl.policies.displayUploadGroupIcon
            )
            .then(
              function (createdGroup) {
                $window.location.href = $filter('seoUrl')(
                  groupsConstants.urlBase,
                  createdGroup.id,
                  ctrl.createGroupRequest.name
                );
              },
              function (error) {
                ctrl.creationInProgress = false;

                switch (error.code) {
                  case groupsConstants.errorCodes.internal.invalidMembership:
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.invalidMembership
                    );
                    break;
                  case groupsConstants.errorCodes.internal.tooManyGroups:
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.tooManyGroups
                    );
                    break;
                  case groupsConstants.errorCodes.internal.insufficientRobux:
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.insufficientRobux
                    );
                    break;
                  case groupsConstants.errorCodes.internal.nameInvalid:
                    ctrl.errorMessages.name = ctrl.translationResources.errorMessages.nameInvalid;
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.nameInvalid
                    );
                    break;
                  case groupsConstants.errorCodes.internal.nameTooLong:
                    ctrl.errorMessages.name = ctrl.translationResources.errorMessages.nameTooLong;
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.nameTooLong
                    );
                    break;
                  case groupsConstants.errorCodes.internal.descriptionTooLong:
                    ctrl.errorMessages.description =
                      ctrl.translationResources.errorMessages.descriptionTooLong;
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.descriptionTooLong
                    );
                    break;
                  case groupsConstants.errorCodes.internal.nameModerated:
                    ctrl.createGroupRequest.name = error.fieldData;
                    ctrl.errorMessages.name = ctrl.translationResources.errorMessages.nameModerated;
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.nameModerated
                    );
                    break;
                  case groupsConstants.errorCodes.internal.groupIconMissing:
                  case groupsConstants.errorCodes.internal.groupIconInvalid:
                    ctrl.errorMessages.groupIcon =
                      ctrl.translationResources.errorMessages.groupIconInvalid;
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.groupIconInvalid
                    );
                    break;
                  case groupsConstants.errorCodes.internal.groupIconTooLarge:
                    ctrl.errorMessages.groupIcon = $filter('formatString')(
                      ctrl.translationResources.errorMessages.groupIconTooLarge,
                      { maxSize: ctrl.metadata.groupConfiguration.iconMaxFileSizeMb }
                    );
                    systemFeedbackService.warning(ctrl.errorMessages.groupIcon);
                    break;
                  case groupsConstants.errorCodes.internal.groupCoverPhotoInvalid:
                    ctrl.errorMessages.groupCoverPhoto =
                      ctrl.translationResources.errorMessages.groupCoverPhotoInvalid;
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.groupCoverPhotoInvalid
                    );
                    break;
                  case groupsConstants.errorCodes.internal.groupCoverPhotoMissing:
                    ctrl.errorMessages.groupCoverPhoto =
                      ctrl.translationResources.errorMessages.groupCoverPhotoMissing;
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.groupCoverPhotoMissing
                    );
                    break;
                  case groupsConstants.errorCodes.internal.tooManyRequests:
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.tooManyRequests
                    );
                    break;
                  case groupsConstants.errorCodes.internal.duplicateName:
                    ctrl.errorMessages.name = ctrl.translationResources.errorMessages.duplicateName;
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.duplicateName
                    );
                    break;
                  case groupsConstants.errorCodes.internal.featureDisabled:
                    systemFeedbackService.warning(
                      ctrl.translationResources.errorMessages.featureDisabled
                    );
                    break;
                  default:
                    systemFeedbackService.warning(ctrl.translationResources.errorMessages.unknown);
                    break;
                }
              }
            );
        },
        function () {
          // Do nothing, group creation modal dismissed.
        }
      );
  };

  ctrl.nameChanged = function () {
    ctrl.errorMessages.name = '';
  };

  ctrl.iconChanged = function () {
    ctrl.errorMessages.groupIcon = '';
  };

  ctrl.coverPhotoChanged = function () {
    ctrl.errorMessages.groupCoverPhoto = '';
  };

  ctrl.loadConfigurationMetadata = function () {
    groupsService.getGroupConfigurationMetadata().then(
      function (result) {
        ctrl.metadata = result;
        ctrl.iconUploadInfo.maxFileSizeInMegabytes = result.groupConfiguration.iconMaxFileSizeMb;
        ctrl.coverPhotoUploadInfo.maxFileSizeInMegabytes =
          result.groupConfiguration.coverPhotoMaxFileSizeMb;
        ctrl.coverPhotoDimensions = result.groupConfiguration.validCoverPhotoDimensions
          ?.split(',')
          .join(', ');
        ctrl.loadConfigureGroupPolicies();
      },
      function () {
        ctrl.layout.pageError = languageResource.get(
          groupsConstants.translations.loadGroupConfigMetadataError
        );
        $log.debug('--loadConfigurationMetadata-error---');
      }
    );
  };

  ctrl.isCreateGroupButtonDisabled = function () {
    return (
      !ctrl.createGroupRequest.name ||
      (!ctrl.iconUploadInfo.file && ctrl.policies.displayUploadGroupIcon) ||
      ctrl.creationInProgress
    );
  };

  ctrl.loadConfigureGroupPolicies = function () {
    if (ctrl.metadata.isDefaultEmblemPolicyEnabled) {
      groupsService.getConfigureGroupRules().then(
        function (response) {
          ctrl.policies = response;
        },
        function () {
          $log.debug('--loadConfigureGroupPolicies-error---');
        }
      );
    } else {
      Object.keys(createGroupConstants.policies).forEach(item => {
        ctrl.policies[item] = true;
      });
    }
  };

  const init = function () {
    groupUtilityService.redirectToCommunitiesIfNecessary();
    ctrl.policies = createGroupConstants.policies;
    ctrl.creationInProgress = false;
    ctrl.absoluteUrls = createGroupConstants.absoluteUrls;
    ctrl.layout = {};

    ctrl.createGroupRequest = {
      name: '',
      description: '',
      isGroupPublic: 'true' // ng-model parses value as string
    };

    ctrl.errorMessages = {
      name: '',
      groupIcon: '',
      groupCoverPhoto: ''
    };

    ctrl.iconUploadInfo = {
      onChange: ctrl.iconChanged
    };

    ctrl.coverPhotoUploadInfo = {
      onChange: ctrl.coverPhotoChanged
    };

    ctrl.translationResources = translationService.getTextResources();
    ctrl.loadConfigurationMetadata();
  };

  ctrl.$onInit = init;
  ctrl.$onChanges = init;
}

createGroupModule.controller('createGroupPageController', createGroupPageController);
export default createGroupPageController;
