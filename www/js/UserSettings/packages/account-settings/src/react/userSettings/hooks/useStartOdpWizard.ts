import { useTranslation } from "react-utilities";
import { startWizard, type FlowExitResult, type StartWizardParams } from "@rbx/amp-v2-wizard";
import { useSnackbar } from "@rbx/user-settings";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import { trackCounter } from "../components/parentalControls/parentZone/observability";
import { ParentZoneCounter } from "../components/parentalControls/parentZone/observability/eventConstants";

const exitCounter = {
  Completed: ParentZoneCounter.WizardActionCompleted,
  Cancelled: ParentZoneCounter.WizardActionCancelled,
  Error: ParentZoneCounter.WizardActionFailed,
} as const;

/**
 * Starts an amp-v2 wizard flow and shows the unknown-error snackbar when the flow ends in an error.
 */
const useStartOdpWizard = (): ((params: StartWizardParams) => Promise<FlowExitResult>) => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  return async (params: StartWizardParams) => {
    const flowRequestType = params.flow?.props?.requestType;
    const requestType = typeof flowRequestType === "string" ? flowRequestType : "Unknown";
    trackCounter(ParentZoneCounter.WizardActionStarted, { requestType });
    const result = await startWizard(params);
    trackCounter(exitCounter[result.reason], { requestType });
    if (result.reason === "Error") {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
    return result;
  };
};

export default useStartOdpWizard;
