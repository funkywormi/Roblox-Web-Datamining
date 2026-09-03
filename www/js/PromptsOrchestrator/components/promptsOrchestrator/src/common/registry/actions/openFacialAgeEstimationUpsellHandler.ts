import "@rbx/core-scripts/global";
import {
  ActionType,
  SduiErrorName,
  type SduiActionHandlerConfig,
  actionTypeName,
  readStringActionParam,
  readSduiResolvedActionParam,
  readBooleanActionParam,
} from "@rbx/sdui-core";
import { PromptErrorName } from "../../telemetry/constants";
import { extractErrorMessageFromUnknownError } from "../../utils/errorMessageUtils";
import { AppPage } from "../../constants/pageConstants";
import { AMP_CONSTANTS, FaeUpsellEntrySurfaceType } from "../../constants/upsellConstants";

const getFaeEntrySurface = (source?: string): string => {
  if (source === AppPage.Home) {
    return FaeUpsellEntrySurfaceType.Homepage;
  }
  if (source === AppPage.ProfilePlatform) {
    return FaeUpsellEntrySurfaceType.ProfileCompletion;
  }
  return FaeUpsellEntrySurfaceType.Unknown;
};

export const openFacialAgeEstimationUpsellHandler = {
  handler: async (actionConfig, _analyticsContext, sduiContext) => {
    const { actionParams } = actionConfig;
    const { errorReporter, pageContext } = sduiContext;

    const accessManagementUpsellV2Service = window.Roblox.AccessManagementUpsellV2Service;

    if (!accessManagementUpsellV2Service) {
      errorReporter.reportSduiError(
        PromptErrorName.AccessManagementUpsellV2ServiceDoesNotExist,
        "Could not proceed with facial age estimation upsell because AccessManagementUpsellV2Service does not exist",
        pageContext,
        {
          actionType: actionTypeName(ActionType.OPEN_FACIAL_AGE_ESTIMATION),
        },
      );
      return;
    }

    const source = readStringActionParam(actionParams, "source", undefined);

    if (source === undefined) {
      errorReporter.reportSduiError(
        SduiErrorName.BuildBaseActionParamsMissingItem,
        "Missing actionParam: source",
        pageContext,
        {
          propName: "source",
          actionType: actionTypeName(ActionType.OPEN_FACIAL_AGE_ESTIMATION),
        },
      );
      return;
    }

    const fallbackContext = `FacialAgeEstimation${getFaeEntrySurface(source)}`;
    const context = readStringActionParam(actionParams, "context", fallbackContext);

    const onSuccess = readSduiResolvedActionParam(actionParams, "onSuccess", undefined);
    const onFailure = readSduiResolvedActionParam(actionParams, "onFailure", undefined);
    const shouldIncludeVpc = readBooleanActionParam(actionParams, "shouldIncludeVpc", true);

    try {
      const params = {
        featureName: shouldIncludeVpc
          ? AMP_CONSTANTS.faeWithVpc.featureName
          : AMP_CONSTANTS.faeWithoutVpc.featureName,
        isAsyncCall: false,
        usePrologue: false,
        namespace: shouldIncludeVpc
          ? AMP_CONSTANTS.faeWithVpc.namespace
          : AMP_CONSTANTS.faeWithoutVpc.namespace,
        featureSpecificData: {
          // We use this instead of setting the `surface` parameter to match the
          // format on app
          context,
        },
      };

      /**
       * TODO: Once the modal queue is implemented, this should use it.
       * One difficulty for the queue is that the FAE upsell modal does not
       * render if the user already is verified. There is no way to know if
       * this happens, and can make it hard for the queue to know when the modal
       * is closed
       */
      const result = await accessManagementUpsellV2Service.startAccessManagementUpsell(params);

      if (result) {
        onSuccess?.onActivated();
      } else {
        onFailure?.onActivated();
      }
    } catch (error) {
      const errorMessage = extractErrorMessageFromUnknownError(
        error,
        "Facial age estimation upsell failed",
      );
      errorReporter.reportSduiError(
        PromptErrorName.FacialAgeEstimationUpsellError,
        errorMessage,
        pageContext,
        {
          actionType: actionTypeName(ActionType.OPEN_FACIAL_AGE_ESTIMATION),
        },
      );
      onFailure?.onActivated();
    }
  },
} satisfies SduiActionHandlerConfig;
