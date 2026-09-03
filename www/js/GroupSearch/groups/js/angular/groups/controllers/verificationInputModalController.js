import { authenticatedUser } from 'header-scripts';
import groupsModule from '../groupsModule';

function verificationInputModalController(
  $scope,
  $uibModalInstance,
  languageResource,
  verificationService,
  verificationResources,
  systemFeedbackService,
  urlService
) {
  'ngInject';

  $scope.layout = {
    codeSent: false,
    isPendingVerification: false,
    invalidCodeError: false,
    invalidCodeErrorMessage: '',
    actionType: verificationResources.actionTypes.robuxSpend,
    codeLength: verificationResources.codeLength,
    codeInputPlaceholder: languageResource.get('Label.CodeInputPlaceholderText', {
      codeLength: verificationResources.codeLength
    }),
    supportPageUrl: urlService.getAbsoluteUrl(verificationResources.urls.support),
    supportLinkPhrase: ''
  };

  $scope.properties = {
    userId: authenticatedUser?.id,
    challengeToken: '',
    code: ''
  };

  function getSupportLinkPhrase(supportUrl) {
    const supportPageLink = `<a class='text-link text-name text-footer contact' href='${supportUrl}' target='_blank'>${languageResource.get(
      'Label.RobloxSupport'
    )}</a>`;
    $scope.layout.supportLinkPhrase = languageResource.get('Label.NeedHelpContactSupport', {
      supportLink: supportPageLink
    });
  }

  function showSuccessBanner() {
    $scope.close();
    const successMessage = languageResource.get('Response.SuccessfulVerificationV2');
    systemFeedbackService.success(successMessage, 100, 6000);
  }

  function showErrorBanner() {
    $scope.close();
    const errorMessage = languageResource.get('Response.VerificationError');
    systemFeedbackService.warning(errorMessage, 100, 6000);
  }

  function showModalError(code) {
    let errorMessage = languageResource.get('Response.VerificationError');
    if (code === verificationResources.errorCodes.internal.invalidCode) {
      errorMessage = languageResource.get('Response.InvalidCodeTryAgain');
    }
    $scope.layout.invalidCodeError = true;
    $scope.layout.invalidCodeErrorMessage = errorMessage;
    verificationService.sendFrictionEvent(verificationResources.events.invalidCodeInput);
  }

  $scope.generateCode = () => {
    getSupportLinkPhrase($scope.layout.supportPageUrl);
    verificationService
      .generateChallengeCode()
      .then(challengeToken => {
        $scope.properties.challengeToken = challengeToken;
      })
      .catch(() => {
        showErrorBanner();
      });
  };

  $scope.verifyCode = () => {
    verificationService.sendFrictionEvent(verificationResources.events.verifyCodeBtn);

    $scope.layout.isPendingVerification = true;
    verificationService
      .verifyChallengeCode(
        $scope.properties.userId,
        $scope.properties.challengeToken,
        $scope.properties.code
      )
      .then(verificationToken => {
        verificationService.sendFrictionEvent(verificationResources.events.successfulVerification);
        verificationService
          .redeemVerificationChallenge($scope.properties.challengeToken, verificationToken)
          .then(success => {
            if (success) {
              showSuccessBanner();
            } else {
              // Redeem failed. Show generic system error message.
              showErrorBanner();
            }
          })
          .catch(() => {
            showErrorBanner();
          });
      })
      .catch(error => {
        showModalError(error.code);
        $scope.layout.isPendingVerification = false;
      });
  };

  $scope.resendCode = () => {
    verificationService.sendFrictionEvent(verificationResources.events.resendCodeBtn);

    verificationService
      .resendCode($scope.properties.userId, $scope.properties.challengeToken)
      .then(() => {
        $scope.layout.codeSent = true;
      })
      .catch(error => {
        showModalError(error.code);
      });
  };

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  $scope.generateCode();
}

groupsModule.controller('verificationInputModalController', verificationInputModalController);
export default verificationInputModalController;