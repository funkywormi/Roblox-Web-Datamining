import { AccessManagementUpsellV2Service } from "@rbx/legacy-webapp-types/Roblox";
import { userId } from "@rbx/core-scripts/meta/user";
import { AmpConfig } from "../../../api/useAppealEligibility";

/** The AMP namespace used for alt-appeal IDV upsells. */
export const ALT_APPEAL_NAMESPACE = "account_management/AccountManagement";

interface StartAppealIdvUpsellParams {
  /** AMP configuration returned by the eligibility endpoint. */
  ampConfig: AmpConfig;
  /**
   * The violation being appealed. Used to build the `violation` resource name
   * (`users/{userId}/violations/{violationId}`) that the AMP feature-check uses
   * to resolve the appeals-specific IDV recourse.
   */
  violationId: string;
  /**
   * Hook-back invoked once the IDV upsell wizard resolves successfully. This is
   * where the caller should re-query eligibility and surface the appeal modal.
   */
  onVerified: () => void;
  /** Invoked when the wizard cannot be started or rejects. */
  onError?: () => void;
}

/**
 * Launches the Access Management (IDV) upsell wizard for an alt appeal.
 *
 * The wizard is the authoritative client-side orchestrator for the Persona IDV
 * flow, so we only need to start it with the server-provided feature/namespace
 * and react to its terminal state.
 *
 * We forward the violation resource name via `ampFeatureCheckData`, which is the
 * only channel the wizard actually sends to the AMP feature-check request (it is
 * base64-encoded into the `extraParameters` query param). AMP uses it to grant
 * access and return the standard `GovernmentId` recourse; the wizard then selects
 * the appeals-specific Persona template based on the client-only `wizardIntent`
 * flag. We do NOT send a template hint from the client.
 */
export const startAppealIdvUpsell = ({
  ampConfig,
  violationId,
  onVerified,
  onError,
}: StartAppealIdvUpsellParams): void => {
  // The legacy types declare this service as always-present, but the global is
  // only defined once its script has loaded on the page — widen to optional so
  // the runtime availability guard below is honored (and not flagged as dead).
  const service = AccessManagementUpsellV2Service as
    | typeof AccessManagementUpsellV2Service
    | undefined;

  if (!service?.startAccessManagementUpsell) {
    onError?.();
    return;
  }

  service
    .startAccessManagementUpsell({
      featureName: ampConfig.featureName,
      namespace: ampConfig.namespace || ALT_APPEAL_NAMESPACE,
      // Client-only hint the wizard uses to select the appeals Persona template
      // (`IdvAppeal`) on the standard GovernmentId recourse. Not sent to AMP.
      wizardIntent: "appeals",
      // Resolve the wizard promise on teardown with the real access result rather
      // than the async-exit default (which always reports "denied"). The appeals
      // wizard skips its "Verification Successful" screen and auto-closes once IDV
      // is granted, so the promise settles as the wizard tears down — our appeal
      // modal then opens on its own, never stacked on top of the wizard.
      isAsyncCall: false,
      // NOTE: `name`/`type` are an AMP backend contract — confirm the exact
      // values the moderation-appeals feature definition reads.
      ampFeatureCheckData: [
        {
          name: "violation",
          type: "String",
          value: `users/${userId()}/violations/${violationId}`,
        },
      ],
    })
    .then(success => {
      if (success) {
        onVerified();
      }
    })
    .catch(() => {
      onError?.();
    });
};
