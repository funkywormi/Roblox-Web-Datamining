import { useTranslation } from "react-utilities";
import { startWizard, type FlowExitResult, type StartWizardParams } from "@rbx/amp-v2-wizard";
import { useSnackbar } from "@rbx/user-settings";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";

/**
 * Starts an amp-v2 wizard flow and shows the unknown-error snackbar when the flow ends in an error.
 */
const useStartOdpWizard = (): ((params: StartWizardParams) => Promise<FlowExitResult>) => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  return async (params: StartWizardParams) => {
    const result = await startWizard(params);
    if (result.reason === "Error") {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
    return result;
  };
};

export default useStartOdpWizard;
