import revenueModule from '../revenueModule';

function revenueSummaryController(revenueService, revenueConstants) {
  'ngInject';

  const ctrl = this;
  let callCount = 0;

  ctrl.updateTimeFrame = currentTimeFrame => {
    const currentCallCount = ++callCount;
    ctrl.layout.isLoading = true;

    // Set the new time frame
    ctrl.currentTimeFrame = currentTimeFrame;
    // Load revenue summary for that time frame
    revenueService
      .getRevenueSummary(ctrl.targetId, ctrl.targetType, currentTimeFrame)
      .then(
        data => {
          if (currentCallCount === callCount) {
            ctrl.loadRevenueSummaryError = false;
            ctrl.revenueSummary = data;
          }
        },
        () => {
          if (currentCallCount === callCount) {
            // Trigger section-content-off
            ctrl.loadRevenueSummaryError = true;
          }
        }
      )
      .finally(() => {
        ctrl.layout.isLoading = false;
      });
  };

  ctrl.getTimeFrameLabel = time => {
    const translations = revenueService.setTranslations();
    if (translations.timeFrames[time]) {
      return translations.timeFrames[time];
    }
    // Fall back on english
    return revenueConstants.timeFrames[time];
  };

  ctrl.getEconomyMetadata = () => {
    revenueService.getEconomyMetadata().then(data => {
      ctrl.economyMetadata = data;
    });
  };

  const init = () => {
    ctrl.layout = {};
    ctrl.timeFrames = revenueConstants.timeFrames;
    ctrl.getEconomyMetadata();
    ctrl.updateTimeFrame(ctrl.timeFrames.Day);
  };

  ctrl.$onInit = init;
}

revenueModule.controller('revenueSummaryController', revenueSummaryController);
export default revenueSummaryController;
