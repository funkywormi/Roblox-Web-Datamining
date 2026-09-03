import { Fragment, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@rbx/foundation-ui";
import { EventTypes } from "../../telemetry/analytics";
import {
  useNotApprovedTranslate,
  useNotApprovedUIConfig,
} from "../../providers/NotApprovedUIProvider";
import reactivateAccount from "../../services/reactivateAccount";
import { AMPRecoursePunishmentType, ProceedAction } from "../../utils/types";
import {
  ACCESS_MANAGEMENT_UPSELL_CAN_LIFT_PUNISHMENT_FEATURE_NAME,
  REACTIVATION_CACHE_UPDATE_WAIT,
} from "../../utils/constants";
import { usePageAnalytics } from "../../context/PageAnalyticsContext";
import ErrorAlert from "../ErrorAlert";

type Props = {
  proceedAction: ProceedAction | null;
  setIsDialogOpen: (isOpen: boolean) => void;
  isAgreed: boolean;
  isDisabled?: boolean;
};

/**
 * A button that determines which action a user can take based on the proceedAction.
 *
 * If the user has a chargeback violation and can reactivate their account through a different way,
 * the button determines if the user can use VPC (parent verification for U18) or email verification (18+).
 */
const NotApprovedProceedButton = ({
  proceedAction,
  setIsDialogOpen,
  isAgreed,
  isDisabled = false,
}: Props): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const { sendPageEvent } = usePageAnalytics();
  const { userModerationApiUrl, httpPost, onVerifyEmail, onVerifyParent, onAccountReactivated } =
    useNotApprovedUIConfig();

  const [isLoading, setIsLoading] = useState(false);

  const reactivateMutation = useMutation({
    mutationFn: () => reactivateAccount(userModerationApiUrl, httpPost),
    onSuccess: async () => {
      /**
       * Sleep here to make sure cache is purged and we get the correct state:
       * https://roblox.slack.com/archives/C04N3DMALTZ/p1717449493064619?thread_ts=1717434570.758779&cid=C04N3DMALTZ
       */
      await new Promise(resolve => {
        setTimeout(resolve, REACTIVATION_CACHE_UPDATE_WAIT);
      });
      onAccountReactivated();
    },
    onMutate: () => {
      setIsLoading(true);
      sendPageEvent(EventTypes.ReactivateClicked);
    },
    onError: (error: unknown) => {
      // TODO: Track this error with Sentry
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("reactivateMutation error", message);
      setIsLoading(false);
    },
    retry: 0,
  });

  let buttonText: string;
  switch (proceedAction) {
    case ProceedAction.Paused:
    case ProceedAction.Reactivate: {
      buttonText = translate("Action.Continue");
      break;
    }
    case ProceedAction.VerifyEmail: {
      buttonText = translate("Label.EmailVerificationButtonText");
      break;
    }
    case ProceedAction.VerifyVPC: {
      buttonText = translate("Label.ParentVerificationButtonText");
      break;
    }
    case null: {
      console.warn(`proceedAction has impossible value ${proceedAction}`);
      buttonText = "";
      break;
    }
  }

  const handleOnClick = async () => {
    switch (proceedAction) {
      case ProceedAction.Reactivate: {
        reactivateMutation.mutate();
        return;
      }
      case ProceedAction.VerifyEmail: {
        // Need to close and open the dialog since the verification dialog will open behind the NAP.
        setIsDialogOpen(false);
        sendPageEvent(EventTypes.EmailVerificationClicked);
        // TODO: Add a callback to open the dialog - right now the dialog stays closed and the user needs to refresh the page.
        await onVerifyEmail?.();
        return;
      }
      case ProceedAction.VerifyVPC: {
        // Need to close and open the dialog since the upsell dialog will open behind the NAP.
        setIsDialogOpen(false);
        sendPageEvent(EventTypes.ParentVerificationClicked);
        await onVerifyParent?.({
          featureName: ACCESS_MANAGEMENT_UPSELL_CAN_LIFT_PUNISHMENT_FEATURE_NAME,
          ampRecourseData: { punishmentType: AMPRecoursePunishmentType.Chargeback },
          isAsyncCall: true,
          usePrologue: false,
        });
        setIsDialogOpen(true);
        return;
      }
      case ProceedAction.Paused: {
        console.warn("cannot reactivate suspended account yet");
        return;
      }
      case null: {
        console.warn(`proceedAction has impossible value ${proceedAction}`);
      }
    }
  };

  return (
    <Fragment>
      {reactivateMutation.isError && (
        <ErrorAlert
          onClose={() => {
            reactivateMutation.reset();
          }}
        />
      )}
      <Button
        onClick={() => {
          handleOnClick().catch((error: unknown) => {
            //TODO: Track this error with Sentry
            const message = error instanceof Error ? error.message : "unknown";
            console.warn("NotApprovedProceedButton onClick error", message);
          });
        }}
        isDisabled={isDisabled || isLoading || !isAgreed}
        isLoading={isLoading}
        variant="Emphasis"
        size="Medium"
        data-testid="proceed-button"
      >
        {buttonText}
      </Button>
    </Fragment>
  );
};

export default NotApprovedProceedButton;
