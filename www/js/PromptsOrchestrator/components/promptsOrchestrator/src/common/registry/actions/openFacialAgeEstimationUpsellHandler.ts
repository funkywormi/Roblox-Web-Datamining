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
import { AppPage } from "../../constants/pageConstants";
import { AMP_CONSTANTS, FaeUpsellEntrySurfaceType } from "../../constants/upsellConstants";
import { submitPrompt } from "../../../overlay-orchestrator/scheduler/submitPrompt";
import { OverlayClosedReason } from "../../../overlay-orchestrator/types";

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
  handler: (actionConfig, _analyticsContext, sduiContext) => {
    const { actionParams } = actionConfig;
    const { errorReporter, pageContext } = sduiContext;

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

    const id = `facial-age-estimation-upsell-${context}`;

    submitPrompt({
      id,
      dedupeKey: id,
      dedupePolicy: "in-flight",
      renderer: "fae-upsell",
      triggerType: "action",
      payload: {
        params,
        // A value of type AppPage is provided when we init SDUI services, but
        // when we read it, it's lost that context. This is a safe suppression
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        appPage: pageContext.appPage as AppPage,
      },
      onTerminal: outcome => {
        if (outcome.status === "closed") {
          if (outcome.reason === OverlayClosedReason.Success) {
            onSuccess?.onActivated();
          } else if (outcome.reason === OverlayClosedReason.Failed) {
            onFailure?.onActivated();
          } else if (outcome.reason === OverlayClosedReason.Error) {
            onFailure?.onActivated();
          }
        }
      },
    });
  },
} satisfies SduiActionHandlerConfig;
