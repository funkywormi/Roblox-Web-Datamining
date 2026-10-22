import React, { useCallback, useEffect, useState } from "react";
import * as hybridResponseService from "@rbx/core-scripts/auth/hybrid-response";
import { DialogBody, ProgressCircle } from "@rbx/foundation-ui";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import ChallengeDialog from "../../../common/challengeDialog";
import InlineChallenge from "../../../common/inlineChallenge";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import useDeviceIntegrityContext from "../hooks/useDeviceIntegrityContext";
import {
  INTEGRITY_REQUEST_TIMEOUT_MS,
  NATIVE_RESPONSE_TIMEOUT_MILLISECONDS,
  ERROR_CONSTANTS,
} from "../app.config";
import { DeviceIntegrityActionType } from "../store/action";
import { IntegrityResultType } from "../interface";

const DeviceIntegrity: React.FC = () => {
  const {
    state: { integrityType, requestHash, renderInline, resources, metricsService, eventService },
    dispatch,
  } = useDeviceIntegrityContext();

  /*
   * Event Handlers
   */
  const getIntegrityToken = useCallback(async () => {
    try {
      if (getDeviceMeta()?.isInApp) {
        // NOTE: currently only supporting play integrity in webview.

        const deviceIntegrityParams = {
          requestHash,
          timeoutMillis: INTEGRITY_REQUEST_TIMEOUT_MS,
        };
        const integrityResultJson = await hybridResponseService.getNativeResponse(
          hybridResponseService.FeatureTarget.GET_INTEGRITY_TOKEN,
          {
            deviceIntegrityParams: JSON.stringify(deviceIntegrityParams),
          },
          NATIVE_RESPONSE_TIMEOUT_MILLISECONDS,
        );

        if (integrityResultJson !== null) {
          const integrityResult = JSON.parse(integrityResultJson) as IntegrityResultType;
          dispatch({
            type: DeviceIntegrityActionType.SET_CHALLENGE_COMPLETED,
            onChallengeCompletedData: {
              integrityType,
              redemptionToken: integrityResult.token,
            },
          });
          eventService.sendChallengeCompletedEvent(integrityResult.result);
          metricsService.fireChallengeCompletedEvent();
          return;
        }
        eventService.sendChallengeInvalidatedEvent(ERROR_CONSTANTS.invalidNativeResponse);
        metricsService.fireChallengeInvalidatedEvent();
      } else {
        eventService.sendChallengeInvalidatedEvent(ERROR_CONSTANTS.notInApp);
        metricsService.fireChallengeInvalidatedEvent();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      eventService.sendChallengeInvalidatedEvent(ERROR_CONSTANTS.getNativeResponseException);
      metricsService.fireChallengeInvalidatedEvent();
    }

    // mark challenge as completed, but not redeemable.
    dispatch({
      type: DeviceIntegrityActionType.SET_CHALLENGE_COMPLETED,
      onChallengeCompletedData: {
        integrityType,
        redemptionToken: "",
      },
    });
  }, [dispatch, integrityType, requestHash, eventService, metricsService]);

  /*
   * Effects
   */

  // Challenge loading effect:
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getIntegrityToken();
  }, []);

  return renderInline ? (
    <InlineChallenge titleText={resources.Description.VerifyingYouAreNotBot}>
      <InlineChallengeBody>
        <div className="flex justify-center">
          <ProgressCircle
            variant="Indeterminate"
            size="Small"
            ariaLabel={resources.Description.VerifyingYouAreNotBot}
          />
        </div>
      </InlineChallengeBody>
    </InlineChallenge>
  ) : (
    // Known issue: this modal has never opened (the legacy `Modal` had no `show`); kept as-is.
    <ChallengeDialog
      open={false}
      onClose={() => undefined}
      hiddenTitle={resources.Description.VerifyingYouAreNotBot}
    >
      <DialogBody className="flex justify-center">
        <ProgressCircle
          variant="Indeterminate"
          size="Small"
          ariaLabel={resources.Description.VerifyingYouAreNotBot}
        />
      </DialogBody>
    </ChallengeDialog>
  );
};

export default DeviceIntegrity;
