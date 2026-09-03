import groupPayoutsModule from '../groupPayoutsModule.js';

function groupPayoutsController(
  $log,
  groupPayoutsService,
  thumbnailConstants,
  groupPayoutsConstants
) {
  'ngInject';

  var ctrl = this;

  ctrl.getRemainingPercentage = function () {
    var percentage = 100;
    ctrl.recipients.forEach(function (recipient) {
      percentage -= recipient.percentageData;
    });
    return Math.ceil(percentage, 0);
  };

  var init = function () {
    if (ctrl.policies && ctrl.policies.isGracefulDegradationEnabled) {
      return;
    }
    ctrl.recipients = [];
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;

    groupPayoutsService.getGroupPayoutRecipients(ctrl.groupId).then(
      function (recipients) {
        ctrl.recipients = recipients;
      },
      function () {
        // If payouts fail to load they just won't display.
        $log.debug('Failed to load group payout recipients.');
      }
    );
  };

  ctrl.$onInit = init;
  ctrl.$onChanges = init;
}

groupPayoutsModule.controller('groupPayoutsController', groupPayoutsController);
export default groupPayoutsController;
