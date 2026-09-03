import { EventStream } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import groupsModule from '../groupsModule';

function verificationService($q, $filter, httpService, verificationResources, groupsConstants, groupsService, languageResource, systemFeedbackService) {
  'ngInject';
  let failedTwoStepVerificationChallengeRenderingAttempts = 0;
  let currentChallengeToken = '';
  let twoStepVerification;

  const handleInvalidatedTwoStepVerificationChallenge = function () {
    const MAX_RENDER_RETRIES = 3;
    // Allow the user to try again once if the session is invalidated. If this doesn't work don't show again.
    if (failedTwoStepVerificationChallengeRenderingAttempts < MAX_RENDER_RETRIES) {
      // eslint-disable-next-line no-use-before-define
      renderTwoStepVerificationChallenge();
    }
    failedTwoStepVerificationChallengeRenderingAttempts += 1;
  };

  const redeemVerificationChallenge = function (challengeToken, verificationToken) {
    return $q((resolve, reject) => {
      httpService
        .httpPost(
          {
            url: groupsConstants.urls.redeemChallenge
          },
          {
            challengeToken,
            verificationToken
          }
        )
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          const errorCode = httpService.getPrimaryApiErrorCode(
            error,
            verificationResources.errorCodes.api
          );
          reject({
            code: errorCode,
            message: error.message
          });
        });
    });
  };

  const receiveTwoStepChallengeToken = function (tokenData) {
    redeemVerificationChallenge(currentChallengeToken, tokenData.verificationToken)
      .then(success => {
        if (success) {
          const successMessage = languageResource.get('Response.SuccessfulVerificationV2');
          systemFeedbackService.success(successMessage, 100, 6000);
        } else {
          // Redeem failed. Show generic error failed message.
          verificationService.showErrorBanner();
        }
      })
      .catch(() => {
        verificationService.showErrorBanner();
      });
  };

  const generateChallengeCode = function () {
    return $q((resolve, reject) => {
      httpService
        .httpPost({
          url: groupsConstants.urls.generateChallenge
        })
        .then(challengeId => {
          resolve(challengeId);
        })
        .catch(error => {
          const errorCode = httpService.getPrimaryApiErrorCode(
            error,
            verificationResources.errorCodes.api
          );
          reject({
            code: errorCode,
            message: error.message
          });
        });
    });
  };

  const renderTwoStepVerificationChallenge = function () {
    generateChallengeCode()
      .then(challengeToken => {
        currentChallengeToken = challengeToken;
        twoStepVerification.renderChallenge({
          containerId: '2sv-popup-container',
          userId: authenticatedUser.id,
          challengeId: challengeToken,
          actionType: twoStepVerification.ActionType.RobuxSpend,
          renderInline: false,
          shouldShowRememberDeviceCheckbox: false,
          onChallengeCompleted: receiveTwoStepChallengeToken,
          onChallengeInvalidated: handleInvalidatedTwoStepVerificationChallenge,
          onModalChallengeAbandoned: () => {}
        });
      })
      .catch(() => {
        this.verificationService.showErrorBanner();
      });
  };

  return {
    getTwoStepVerificationConfiguration() {
      return $q((resolve, reject) => {
        httpService
          .httpGet({
            url: $filter('formatString')(groupsConstants.urls.get2SVConfiguration, {
              userId: authenticatedUser?.id
            })
          })
          .then(result => {
            groupsService.getGroupConfigurationMetadata().then(function (metadata) {
              let is2SVEnabled = false;
              let isUsingTwoStepWebviewComponent = false;
              isUsingTwoStepWebviewComponent =
                metadata.groupConfiguration.isUsingTwoStepWebviewComponent;

              if (isUsingTwoStepWebviewComponent) {
                is2SVEnabled = result.methods.some(method => method.enabled);
              } else {
                is2SVEnabled = result.methods.some(
                  method =>
                    method.mediaType === groupsConstants.twoStepMediaType.email && method.enabled
                );
              }

              resolve({
                twoStepEnabled: is2SVEnabled,
                usingTwoStepWebviewComponent: isUsingTwoStepWebviewComponent
              });
            });
          })
          .catch(() => {
            reject(false);
          });
      });
    },

    generateChallengeCode() {
      return $q((resolve, reject) => {
        httpService
          .httpPost({
            url: groupsConstants.urls.generateChallenge
          })
          .then(challengeId => {
            resolve(challengeId);
          })
          .catch(error => {
            const errorCode = httpService.getPrimaryApiErrorCode(
              error,
              verificationResources.errorCodes.api
            );
            reject({
              code: errorCode,
              message: error.message
            });
          });
      });
    },

    verifyChallengeCode(userId, challengeId, code) {
      return $q((resolve, reject) => {
        httpService
          .httpPost(
            {
              url: $filter('formatString')(groupsConstants.urls.verifyChallenge, { userId })
            },
            {
              challengeId,
              actionType: verificationResources.actionTypes.robuxSpend,
              code
            }
          )
          .then(data => {
            resolve(data.verificationToken);
          })
          .catch(error => {
            const errorCode = httpService.getPrimaryApiErrorCode(
              error,
              verificationResources.errorCodes.api
            );
            reject({
              code: errorCode,
              message: error.message
            });
          });
      });
    },

    redeemVerificationChallenge(challengeToken, verificationToken) {
      return $q((resolve, reject) => {
        httpService
          .httpPost(
            {
              url: groupsConstants.urls.redeemChallenge
            },
            {
              challengeToken,
              verificationToken
            }
          )
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            const errorCode = httpService.getPrimaryApiErrorCode(
              error,
              verificationResources.errorCodes.api
            );
            reject({
              code: errorCode,
              message: error.message
            });
          });
      });
    },

    resendCode(userId, challengeId) {
      return $q((resolve, reject) => {
        httpService
          .httpPost(
            {
              url: $filter('formatString')(groupsConstants.urls.resendCode, { userId })
            },
            {
              challengeId,
              actionType: verificationResources.actionTypes.robuxSpend
            }
          )
          .then(() => {
            resolve({});
          })
          .catch(error => {
            const errorCode = httpService.getPrimaryApiErrorCode(
              error,
              verificationResources.errorCodes.api
            );
            reject({
              code: errorCode,
              message: error.message
            });
          });
      });
    },

    sendFrictionEvent(buttonName) {
      if (EventStream && EventStream.SendEvent) {
        EventStream.SendEvent(
          verificationResources.events.frictionEventType,
          verificationResources.events.twoStepVerificationCtx,
          { btn: buttonName }
        );
      }
    },

    showErrorBanner() {
      const errorMessage = languageResource.get('Response.VerificationError');
      systemFeedbackService.warning(errorMessage, 100, 6000);
    },

    popUpTwoStepVerificationChallenge(buttonName, TwoStepVerification) {
      twoStepVerification = TwoStepVerification;

      this.sendFrictionEvent(buttonName);
      renderTwoStepVerificationChallenge();
    }
  };
}

groupsModule.factory('verificationService', verificationService);

export default verificationService;
