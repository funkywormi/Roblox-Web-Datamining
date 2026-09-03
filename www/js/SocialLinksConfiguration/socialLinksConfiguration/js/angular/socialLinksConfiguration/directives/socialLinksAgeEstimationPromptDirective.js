import { SocialLinksAgeEstimationPromptService } from 'Roblox';
import socialLinksConfigurationModule from '../socialLinksConfigurationModule';

function socialLinksAgeEstimationPrompt() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      metadata: '<',
      policies: '<',
      socialLinksVerificationStatus: '<'
    },
    link(scope, element) {
      const renderAgeEstimationPrompt = () => {
        SocialLinksAgeEstimationPromptService?.renderSocialLinkAgeEstimationPrompt(
          element[0],
          scope.socialLinksVerificationStatus
        );
      };

      element.ready(renderAgeEstimationPrompt);

      ['group', 'metadata', 'socialLinksVerificationStatus'].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderAgeEstimationPrompt();
            }
          },
          true
        );
      });
    }
  };
}

socialLinksConfigurationModule.directive(
  'socialLinksAgeEstimationPrompt',
  socialLinksAgeEstimationPrompt
);

export default socialLinksAgeEstimationPrompt;
