import systemFeedbackModule from '../systemFeedbackModule';

const systemFeedbackComponent = {
  templateUrl: 'system-feedback-v2',
  bindings: {
    successMessage: '<',
    loadingMessage: '<',
    warningMessage: '<',
    timeoutShow: '<',
    timeoutHide: '<'
  },
  controller: [
    'systemFeedbackService',
    function(systemFeedbackService) {
      const ctrl = this;

      const updateDefaultValue = () => {
        systemFeedbackService.setDefaultConfig({
          successMessage: ctrl.successMessage,
          loadingMessage: ctrl.loadingMessage,
          warningMessage: ctrl.warningMessage,
          timeoutShow: ctrl.timeoutShow,
          timeoutHide: ctrl.timeoutHide,
          isHtmlAllowed: ctrl.isHtmlAllowed
        });
      };

      ctrl.$onInit = () => {
        const bindings = systemFeedbackService.getBindings();
        this.params = bindings.params;
        this.closeBanner = bindings.closeBanner;
      };

      ctrl.$onChanges = () => {
        updateDefaultValue();
      };
    }
  ]
};

systemFeedbackModule.component('systemFeedback', systemFeedbackComponent);

export default systemFeedbackComponent;
