/* eslint-disable no-param-reassign */
import { AccountIntegrityChallengeService } from 'Roblox';
import groupPayoutsModule from '../groupPayoutsModule';

function configureGroupOneTimePayoutController(
  $filter,
  $uibModal,
  thumbnailConstants,
  groupPayoutsConstants,
  groupsConstants,
  groupsService,
  groupPayoutsService,
  systemFeedbackService,
  languageResource,
  verificationService,
  verificationResources
) {
  'ngInject';

  const ctrl = this;
  const numToPercent = 0.01;

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

  ctrl.addPayoutRecipients = function (users) {
    users.forEach(user => {
      ctrl.payouts.users.push({
        userId: user.id,
        username: user.name,
        nameForDisplay: user.displayName,
        role: user.role,
        url: user.url,
        amount: 0,
        calcAmount: 0
      });
    });
  };

  ctrl.updatePayoutType = function (type) {
    ctrl.payouts.type = type;
    ctrl.layout.maxPayoutValue =
      ctrl.payouts.type === groupPayoutsConstants.payoutTypes.Percent ? 100 : ctrl.payouts.revenue;
    ctrl.resetPayout();
  };

  ctrl.resetPayout = function () {
    ctrl.payouts.users.forEach(function (user) {
      user.amount = 0;
      user.calcAmount = 0;
    });
    ctrl.payouts.remaining = ctrl.payouts.revenue;
    ctrl.payouts.paying = 0;
    ctrl.layout.fundsError = null;
  };

  ctrl.updatePayout = function () {
    let amount = 0;
    ctrl.payouts.users.forEach(function (user) {
      user.calcAmount =
        ctrl.payouts.type === ctrl.layout.payoutTypes.Amount
          ? user.amount
          : Math.floor(ctrl.payouts.revenue * (user.amount * numToPercent));
      amount += user.calcAmount;
    });
    const remaining = ctrl.payouts.revenue - amount;
    if (remaining < 0) {
      ctrl.layout.fundsError = languageResource.get('Message.NotEnoughFundsDistribute');
      ctrl.payouts.paying = amount;
      ctrl.payouts.remaining = 0;
    } else {
      ctrl.layout.fundsError = null;
      ctrl.payouts.remaining = remaining;
      ctrl.payouts.paying = amount;
    }
  };

  ctrl.removeUser = function (index) {
    ctrl.payouts.users.splice(index, 1);
    ctrl.updatePayout();
  };

  ctrl.getPayoutTypeLabel = function (type) {
    const translations = groupPayoutsService.setTranslations();
    if (translations.payoutTypes[type]) {
      return translations.payoutTypes[type];
    }
    // Fall back on english
    return groupPayoutsConstants.payoutTypes[type];
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

  ctrl.sendPayment = function () {
    ctrl.layout.isPayoutPending = true;

    let type = groupPayoutsConstants.apiPayoutTypes.Amount;
    if (ctrl.payouts.type === ctrl.layout.payoutTypes.Percent) {
      type = ctrl.layout.payoutTypes.Percent;
    }
    const recipients = [];
    ctrl.payouts.users.forEach(function (user) {
      recipients.push({
        recipientId: user.userId,
        recipientType: groupPayoutsConstants.payoutRecipientTypes.User,
        amount: user.amount
      });
    });
    groupPayoutsService.postGroupPayout(ctrl.groupId, type, recipients).then(
      function () {
        const getPayout = $filter('number')(ctrl.payouts.paying, 0);
        ctrl
          .reloadGroupFunds()
          .then(function (groupFunds) {
            ctrl.initPayouts(groupFunds);
          })
          .finally(function () {
            ctrl.layout.isPayoutPending = false;
          });
        systemFeedbackService.success(
          languageResource.get('Message.AmountPaidOut', { amount: getPayout })
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
            systemFeedbackService.warning(languageResource.get('Message.DistributeFundsError'));
          }
        }
        ctrl.layout.isPayoutPending = false;
      }
    );
  };

  ctrl.isDistributeButtonDisabled = function () {
    return (
      ctrl.layout.fundsError ||
      ctrl.payouts.users.length === 0 ||
      ctrl.payouts.paying === 0 ||
      ctrl.layout.isPayoutPending
    );
  };

  ctrl.initPayouts = function (groupFunds) {
    ctrl.layout.maxPayoutValue = groupFunds;

    ctrl.payouts = {
      users: [],
      paying: 0,
      type: ctrl.layout.payoutTypes.Amount,
      revenue: groupFunds,
      remaining: groupFunds
    };
  };

  ctrl.loadPayoutRestriction = function () {
    ctrl.layout.isLoading = true;
    groupPayoutsService
      .getGroupPayoutRestriction(ctrl.groupId)
      .then(
        function (payoutRestriction) {
          ctrl.layout.canUseOneTimePayout = payoutRestriction.canUseOneTimePayout;
        },
        function () {
          ctrl.layout.loadError = true;
          // eslint-disable-next-line no-undef
          $log.debug('Failed to load group payout restriction.');
        }
      )
      .finally(function () {
        ctrl.layout.isLoading = false;
      });
  };

  const init = function () {
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.layout = {
      payoutTypes: groupPayoutsConstants.payoutTypes
    };

    ctrl.loadPayoutRestriction();
    ctrl.initPayouts(ctrl.groupFunds);
  };

  ctrl.$onInit = init;
}

groupPayoutsModule.controller(
  'configureGroupOneTimePayoutController',
  configureGroupOneTimePayoutController
);
export default configureGroupOneTimePayoutController;
