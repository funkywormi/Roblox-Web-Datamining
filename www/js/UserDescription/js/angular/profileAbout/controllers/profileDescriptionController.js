import { authenticatedUser } from 'header-scripts';
import profileAboutModule from '../profileAboutModule';

function profileDescriptionController(
  $log,
  $location,
  profileDescriptionService,
  profileDescriptionConstants,
  descriptionLayout,
  languageResource
) {
  'ngInject';

  const ctrl = this;

  ctrl.initializeDescription = function () {
    profileDescriptionService.getDescription().then(
      function (result) {
        ctrl.data.description = result.description;
        ctrl.layout.showEditBox = ctrl.isDescriptionEmpty();
      },
      function (error) {
        $log.debug('Error getting personal description');
        ctrl.layout.descriptionError = profileDescriptionService.getDescriptionError(error);
      }
    );
  };

  ctrl.updateDescription = function (shouldSubmit) {
    if (shouldSubmit) {
      profileDescriptionService.updateDescription(ctrl.data.description).then(
        function (result) {
          ctrl.data.description = result.description;
          ctrl.layout.showEditBox = false;
          ctrl.layout.descriptionError = null;
        },
        function (error) {
          $log.debug('Error updating personal description');
          ctrl.layout.descriptionError = profileDescriptionService.getDescriptionError(error);
        }
      );
    } else {
      // return description back to original description if changes were made
      ctrl.initializeDescription();
      ctrl.layout.showEditBox = false;
      ctrl.layout.descriptionError = null;
    }
  };

  ctrl.openEditBox = function () {
    ctrl.layout.showEditBox = true;
  };

  ctrl.isDescriptionEmpty = function () {
    return ctrl.data.description == null || ctrl.data.description.length === 0;
  };

  ctrl.loadAccountInformationMetadata = function () {
    profileDescriptionService.getAccountInformationMetadata().then(
      function (result) {
        ctrl.layout.maxDescriptionLength = result.MaxUserDescriptionLength;
      },
      function (error) {
        ctrl.layout.maxDescriptionLength = profileDescriptionConstants.defaultMaxDescriptionLength;
        $log('Unable to load metadata');
      }
    );
  };

  function parseProfileUserId(url) {
    const regexExp = /\/users\/(\d+)\/profile/g;
    const match = regexExp.exec(url);
    if (match && match.length > 1) {
      return Number(match[1]);
    }
    return null;
  }

  function init() {
    // Making sure that scope.init is not initialized multiple times
    if (ctrl.layout) {
      return;
    }
    const profileUserId = parseProfileUserId($location.absUrl());
    ctrl.layout = {
      showSeeAllButton: false,
      showEditBox: false,
      descriptionError: null,
      canEdit: authenticatedUser?.id === profileUserId
    };
    ctrl.data = {
      description: ''
    };
    ctrl.loadAccountInformationMetadata();
    ctrl.initializeDescription();
  }

  ctrl.$onInit = init;
  ctrl.$onChanges = init;
}

profileAboutModule.controller('profileDescriptionController', profileDescriptionController);
export default profileDescriptionController;
