import { AccountIntegrityChallengeService } from 'Roblox';
import groupPayoutsModule from '../groupPayoutsModule';

function configureGroupRecurringPayoutController(
  groupPayoutsService,
  $uibModal,
  $log,
  thumbnailConstants,
  groupPayoutsConstants,
  groupsConstants,
  systemFeedbackService,
  groupUtilityService,
  languageResource,
  verificationService,
  verificationResources
) {
  'ngInject';

  const ctrl = this;

  ctrl.showAddPayoutRecipientModal = function () {
    const modalParams = {
      animation: false,
      templateUrl: 'add-payout-recipient-modal',
      controller: 'addPayoutRecipientModalController',
      resolve: {
        modalData: {
          groupId: ctrl.groupId,
          recipients: ctrl.payouts.users,
          addPayoutRecipients: ctrl.addPayoutRecipients
        }
      }
    };

    $uibModal.open(modalParams);
  };

  ctrl.loadPayouts = function () {
    ctrl.layout.isLoading = true;
    groupPayoutsService
      .getGroupPayoutRecipients(ctrl.groupId)
      .then(
        function (recipients) {
          if (recipients.length === 0) {
            ctrl.layout.isLoading = false;
          }
          recipients.forEach(function (recipient) {
            const { id, name, displayName } = recipient.user;
            ctrl.payouts.users.push({
              userId: id,
              username: name,
              nameForDisplay: displayName,
              role: recipient.role.name,
              amount: recipient.percentage,
              url: groupUtilityService.profilePageUrl(id)
            });
            ctrl.payouts.paying += recipient.percentage;
            ctrl.payouts.userInput = '';
          });
        },
        function () {
          ctrl.layout.loadError = true;
          $log.debug('Failed to load group payout recipients.');
        }
      )
      .finally(function () {
        ctrl.layout.isLoading = false;
      });
  };

  ctrl.addPayoutRecipients = function (users) {
    users.forEach(user => {
      const { id, displayName, name } = user;
      ctrl.payouts.users.push({
        userId: id,
        username: name,
        displayName,
        nameForDisplay: displayName,
        role: user.role,
        amount: 0,
        url: user.url
      });
    });
  };

  ctrl.updatePayout = function () {
    let amount = 0;
    ctrl.payouts.users.forEach(function (user) {
      amount += user.amount;
    });
    const remaining = 100 - amount;
    if (remaining < 0) {
      ctrl.layout.fundsError = languageResource.get('Message.NotEnoughFundsDistribute');
      ctrl.payouts.paying = amount;
    } else {
      ctrl.layout.fundsError = null;
      ctrl.payouts.paying = amount;
    }
  };

  ctrl.removeUser = function (index) {
    ctrl.payouts.users.splice(index, 1);
    ctrl.updatePayout();
  };

  ctrl.showVerificationRedirectModal = function () {
    verificationService.sendFrictionEvent(
      verificationResources.events.settingsRedirectModalTriggered
    );
    const modalParams = {
      animation: false,
      templateUrl: 'verification-redirect-modal',
      controller: 'verificationRedirectModalController'
    };
    $uibModal.open(modalParams);
  };

  ctrl.showVerificationInputModal = function (isUsingTwoStepWebviewComponent) {
    if (isUsingTwoStepWebviewComponent) {
      const { TwoStepVerification } = AccountIntegrityChallengeService;

      verificationService.popUpTwoStepVerificationChallenge(
        verificationResources.events.codeInputModalTriggered,
        TwoStepVerification
      );
    } else {
      const modalParams = {
        animation: false,
        templateUrl: 'verification-input-modal',
        controller: 'verificationInputModalController'
      };
      $uibModal.open(modalParams);
    }
  };

  ctrl.updateRecurringPayout = function () {
    const type = groupPayoutsConstants.apiPayoutTypes.Percent;

    const recipients = [];
    ctrl.payouts.users.forEach(function (user) {
      recipients.push({
        recipientId: user.userId,
        recipientType: groupPayoutsConstants.payoutRecipientTypes.User,
        amount: user.amount
      });
    });

    groupPayoutsService.postGroupRecurringPayout(ctrl.groupId, type, recipients).then(
      function () {
        systemFeedbackService.success(
          languageResource.get('Message.PercentagePaidOut', { percentage: ctrl.payouts.paying })
        );
      },
      function (data) {
        if (data.errors && data.errors.length > 0) {
          if (
            data.errors[0].code === groupsConstants.errorCodes.internal.twoStepVerificationRequired
          ) {
            verificationService
              .getTwoStepVerificationConfiguration()
              .then(result => {
                if (result.twoStepEnabled) {
                  ctrl.showVerificationInputModal(result.usingTwoStepWebviewComponent);
                } else {
                  ctrl.showVerificationRedirectModal();
                }
              })
              .catch(() => {
                ctrl.showVerificationRedirectModal(); // on error, default to settings redirect modal
              });
          } else {
            systemFeedbackService.warning(
              languageResource.get('Message.UpdateRecurringPayoutsError')
            );
          }
        }
      }
    );
  };

  ctrl.loadPayoutRestriction = function () {
    ctrl.layout.isLoading = true;
    groupPayoutsService
      .getGroupPayoutRestriction(ctrl.groupId)
      .then(
        function (payoutRestriction) {
          ctrl.layout.canUseRecurringPayout = payoutRestriction.canUseRecurringPayout;
        },
        function () {
          ctrl.layout.loadError = true;
          $log.debug('Failed to load group payout restriction.');
        }
      )
      .finally(function () {
        ctrl.layout.isLoading = false;
      });
  };

  const init = function () {
    ctrl.layout = {};
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.payouts = {
      users: [],
      paying: 0
    };

    ctrl.loadPayoutRestriction();
    ctrl.loadPayouts();
  };

  ctrl.$onInit = init;
}

groupPayoutsModule.controller(
  'configureGroupRecurringPayoutController',
  configureGroupRecurringPayoutController
);
export default configureGroupRecurringPayoutController;
