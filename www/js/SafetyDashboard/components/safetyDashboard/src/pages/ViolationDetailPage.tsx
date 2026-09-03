import { useState, ReactElement } from "react";
import { useParams } from "react-router-dom";
import { createSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import AppealsModal from "../features/violations/violationDetails/AppealsModal";
import { useViolation } from "../api/useViolation";
import {
  InvalidViolationError,
  isHTTPError,
  isMock404,
} from "../features/violations/util/violations";
import { useCreateAppeal, isAppealIneligibleError } from "../api/useCreateAppeal";
import { useAppealEligibility } from "../api/useAppealEligibility";
import { startAppealIdvUpsell } from "../features/violations/util/appealIdvUpsell";
import { useEffectUntilTrueOnce } from "../hooks/useEffectUntilTrueOnce";
import {
  sendApiErrorEvent,
  sendAppealEligibilityEvent,
  sendRequestAppealEvent,
  sendStartAppealEvent,
  sendViolationPageLoadEvent,
} from "../telemetry/appealsEvents";
import { GET_VIOLATION_QUERY_KEY } from "../api/queryKeys";
import { getAnalyticsViolationType } from "../features/violations/util/eventsUtils";
import SuccessModal from "../features/violations/violationDetails/SuccessModal";
import VerifyIdentityModal from "../features/violations/violationDetails/VerifyIdentityModal";
import Timestamp from "../features/violations/violationDetails/Timestamp";
import WhatHappened from "../features/violations/violationDetails/WhatHappened/WhatHappened";
import ActivityReviewed from "../features/violations/violationDetails/ActivityReviewed/ActivityReviewed";
import SendAppealSection from "../features/violations/violationDetails/SendAppealSection";
import Timeline from "../features/violations/violationDetails/Timeline/Timeline";
import ViolationDetailsError from "../features/violations/violationDetails/ViolationDetailsError";
import ViolationDetailsSkeleton from "../features/violations/violationDetails/ViolationDetailsSkeleton";
import useAppealsPortalGuacConfiguration from "../api/useAppealsPortalGuacConfiguration";
import PageHeader from "../shared/components/PageHeader";
import { useBackNavigation } from "../hooks/useBackNavigation";

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

/**
 * The page that renders more specific details regarding a specific violation. The violation ID is aquired
 * from the URL parameters and then fetched from the API.
 *
 * With the violation's data, we showcase the appeal timeline if the user has any appeals, a "What happened" section
 * that outlines the broken rules that the user violated, and an "Activity reviewed" section that shows the evidence
 * that was used to determine the violation's decision.
 *
 * The page also allows users to submit an appeal for the given violation if the appeal window is still open.
 */
const ViolationDetailPage = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const { data: violation, isLoading, isError, error, refetch } = useViolation(id);
  const createAppeal = useCreateAppeal(id);

  const { translate } = useTranslation();
  const { data: guacConfig, isLoading: isLoadingGuacConfig } = useAppealsPortalGuacConfiguration();
  const onBack = useBackNavigation();

  /**
   * Eligibility only refines the inline appeal entry point, so we skip the
   * request for violations that have no inline appeal (support/none).
   */
  const isInlineAppeal = violation?.appealMethod === "inline";
  const {
    data: eligibility,
    isLoading: isLoadingEligibility,
    refetch: refetchEligibility,
  } = useAppealEligibility(id, {
    enabled: isInlineAppeal,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(false);

  /*
   * Fire the API-error event once when the violation load fails. Not-found is an
   * expected outcome (rendered as NotFound) rather than an API failure, so we
   * skip the event in that case.
   */
  useEffectUntilTrueOnce(() => {
    if (!isError) {
      return false;
    }

    const isNotFound =
      error instanceof InvalidViolationError ||
      (isHTTPError(error) && error.status === 404) ||
      isMock404(error);

    if (!isNotFound) {
      sendApiErrorEvent({
        urlOrKey: GET_VIOLATION_QUERY_KEY,
        statusCode: isHTTPError(error) ? error.status : 0,
        message: error instanceof Error ? error.message : String(error),
      });
    }

    return true;
  });

  /*
   * Fire the page-load event once after the violation data is fully loaded. We
   * keep returning false while in an error state (rather than completing on
   * error) so that a successful refetch still reports the page load.
   */
  useEffectUntilTrueOnce(() => {
    if (isError || !violation) {
      return false;
    }

    sendViolationPageLoadEvent({
      currentState: violation.state,
      isAppealable: violation.appealable,
      appealCount: violation.appeals.length,
      lastViolationReason: Object.keys(violation.abuse_type_keys).join(","),
      violationType: getAnalyticsViolationType(violation),
      isV2UI: true,
    });

    return true;
  });

  /*
   * Once eligibility resolves for an inline-appealable violation, log the result
   * for the IDV funnel. Only meaningful when there is an inline appeal entry.
   */
  useEffectUntilTrueOnce(() => {
    if (isError) {
      return true;
    }
    // Wait for the violation before deciding whether an inline appeal exists.
    if (!violation) {
      return false;
    }
    // Loaded but no inline appeal entry → eligibility is not applicable.
    if (!isInlineAppeal) {
      return true;
    }
    // Inline appeal: wait for the eligibility result before logging it.
    if (!eligibility) {
      return false;
    }

    sendAppealEligibilityEvent({
      isEligible: eligibility.isEligible,
      violationType: getAnalyticsViolationType(violation),
      isV2UI: true,
    });

    return true;
  });

  if (isLoading || isLoadingGuacConfig || (isInlineAppeal && isLoadingEligibility)) {
    return (
      <div className="max-width-[850px] width-full margin-x-auto flex flex-col gap-xxlarge padding-x-large">
        <PageHeader title={translate("Label.Details")} onBack={onBack} />
        <ViolationDetailsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-width-[850px] width-full margin-x-auto flex flex-col gap-xxlarge padding-x-large">
        <PageHeader title={translate("Label.Details")} onBack={onBack} />
        <ViolationDetailsError error={error} onRefresh={refetch} />
      </div>
    );
  }

  /*
   * Logs the "appeal started" funnel event for the click on "Send Appeal".
   * `requiresIdv` distinguishes the IDV pre-condition path from a direct appeal.
   */
  const fireStartAppealEvent = (requiresIdv: boolean) => {
    sendStartAppealEvent({
      isEligible: eligibility?.isEligible ?? true,
      requiresIdv,
      prevAppealCount: violation.appeals.length,
      violationType: getAnalyticsViolationType(violation),
      violationReason: Object.keys(violation.abuse_type_keys).join(","),
      isV2UI: true,
    });
  };

  const onShowAppealModal = () => {
    fireStartAppealEvent(false);
    setShowModal(true);
  };

  /*
   * Entry point for violations whose eligibility is not `true`: the user must
   * complete an IDV pre-condition before they can appeal. We first show an
   * appeal-specific intro screen (the AMP wizard's prologue is generic), then
   * launch the IDV upsell wizard once the user confirms via "Continue".
   */
  const onStartIdvFlow = () => {
    fireStartAppealEvent(true);

    const ampConfig = eligibility?.ampConfig;
    if (!ampConfig) {
      // No AMP pre-condition to satisfy; fall back to opening the appeal modal.
      setShowModal(true);
      return;
    }

    setShowVerifyIdentityModal(true);
  };

  /*
   * Launches the Access Management (IDV) upsell wizard once the user confirms on
   * the verify-identity intro screen. The appeals wizard skips its own
   * "Verification Successful" screen and auto-closes as soon as IDV is granted, so
   * the promise resolves as the wizard tears down. Opening the appeal modal in
   * `onVerified` therefore surfaces it automatically — no extra click, no stacking.
   */
  const onContinueIdv = () => {
    setShowVerifyIdentityModal(false);

    const ampConfig = eligibility?.ampConfig;
    if (!ampConfig) {
      // Eligibility changed out from under the intro screen; fall back to the modal.
      setShowModal(true);
      return;
    }

    startAppealIdvUpsell({
      ampConfig,
      violationId: id,
      onVerified: () => {
        // Re-query eligibility so the Send Appeal entry point flips to the direct
        // (no-IDV) path, then open the appeal modal. This fires after the wizard
        // has skipped its success screen and torn itself down, so the modal
        // appears on its own without stacking.
        refetchEligibility().catch(() => {
          // best-effort; the appeal entry simply keeps its current state
        });
        setShowModal(true);
      },
      onError: () => {
        systemFeedbackService.warning(translate("Response.UnexpectedError"));
      },
    });
  };

  const onSubmitAppeal = async (text?: string, optOutCommunication?: boolean) => {
    try {
      await createAppeal.mutateAsync({
        violation: violation.name,
        message: text ?? "",
        // We only want to set communication_opt_out if truthy for safety
        ...(optOutCommunication && { communication_opt_out: optOutCommunication }),
      });

      setShowModal(false);
      setShowSuccessModal(true);

      sendRequestAppealEvent({
        prevAppealCount: violation.appeals.length,
        msgLength: text?.length ?? 0,
        violationType: getAnalyticsViolationType(violation),
        violationReason: Object.keys(violation.abuse_type_keys).join(","),
        isV2UI: true,
        optOutCommunication,
      });
    } catch (e) {
      setShowModal(false);

      // A 403 means the server rejected the appeal as ineligible (e.g. the UX is
      // out of sync and the user still needs IDV). Re-query eligibility so the
      // appeal entry point re-renders with the correct requirement, and surface a
      // message specific to ineligibility rather than the generic error.
      if (isAppealIneligibleError(e)) {
        refetchEligibility().catch(() => {
          // best-effort; the appeal entry simply keeps its current state
        });
        systemFeedbackService.warning(translate("Description.AppealIneligible"));
        return;
      }

      systemFeedbackService.warning(translate("Response.UnexpectedError"));
    }
  };

  return (
    <div
      data-testid="violation-detail-page"
      className="max-width-[850px] width-full margin-x-auto padding-x-large"
    >
      <SystemFeedback />

      <div className="flex flex-col gap-xxlarge">
        <PageHeader title={translate("Label.Details")} onBack={onBack} />

        <div className="flex flex-col gap-xsmall padding-bottom-small">
          <span className="text-heading-small">{violation.i18n.rejectionTitle}</span>
          <Timestamp timestamp={violation.create_time} />
        </div>

        <Timeline violation={violation} />
        <WhatHappened violation={violation} />
        <ActivityReviewed violation={violation} />
        <SendAppealSection
          violation={violation}
          onShowAppealModal={onShowAppealModal}
          onStartIdvFlow={onStartIdvFlow}
          eligibility={eligibility}
        />
      </div>

      {showVerifyIdentityModal && (
        <VerifyIdentityModal
          onContinue={onContinueIdv}
          onClose={() => {
            setShowVerifyIdentityModal(false);
          }}
        />
      )}

      {showModal && (
        <AppealsModal
          onClose={() => {
            setShowModal(false);
          }}
          onSubmit={onSubmitAppeal}
          isLoading={createAppeal.isLoading}
          enableOptOutCommunication={guacConfig?.EnableOptOutCommunication ?? false}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ViolationDetailPage;
