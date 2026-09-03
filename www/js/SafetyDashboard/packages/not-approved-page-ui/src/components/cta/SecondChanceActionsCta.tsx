import { Fragment, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@rbx/foundation-ui";
import { EventTypes } from "../../telemetry/analytics";
import {
  useNotApprovedTranslate,
  useNotApprovedUIConfig,
} from "../../providers/NotApprovedUIProvider";
import { usePageAnalytics } from "../../context/PageAnalyticsContext";
import useAppealsRedirect from "../../hooks/useAppealsRedirect";
import ErrorAlert from "../ErrorAlert";
import reactivateAccountByCommutation from "../../services/reactivateAccountByCommutation";
import { REACTIVATION_CACHE_UPDATE_WAIT } from "../../utils/constants";

/**
 * Renders the CTA buttons for the Second Chance conclusion page. The user can
 * either reactive their account or send an appeal if they believe that we made a mistake.
 */
const SecondChanceActionsCta = () => {
  const translate = useNotApprovedTranslate();
  const { sendPageEvent } = usePageAnalytics();
  const { httpPost, apiGatewayUrl, onAccountReactivated } = useNotApprovedUIConfig();
  const { handleAppealsClick } = useAppealsRedirect({ preferViolationDetail: true });

  const [isReactivateLoading, setIsReactivateLoading] = useState(false);

  const reactivateMutation = useMutation({
    mutationFn: () => reactivateAccountByCommutation(apiGatewayUrl, httpPost),
    onMutate: () => {
      setIsReactivateLoading(true);
      sendPageEvent(EventTypes.SecondChanceReactivateClicked);
    },
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
    onError: (error: unknown) => {
      // TODO: Track this error with Sentry
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("reactivateMutation error", message);
      setIsReactivateLoading(false);
    },
    retry: 0, // pin to prevent double-firing onMutate if QueryClient defaults change
  });

  return (
    <Fragment>
      {reactivateMutation.isError && (
        <ErrorAlert
          onClose={() => {
            reactivateMutation.reset();
          }}
        />
      )}

      <div className="flex flex-col gap-small medium:flex-row-reverse">
        <Button
          onClick={() => {
            reactivateMutation.mutate();
          }}
          variant="Emphasis"
          size="Medium"
          className="min-width-2600"
          data-testid="second-chance-reactivate-button"
          isLoading={isReactivateLoading}
          isDisabled={isReactivateLoading}
        >
          {translate("Action.OK")}
        </Button>

        <Button
          onClick={handleAppealsClick}
          variant="Standard"
          size="Medium"
          data-testid="second-chance-send-appeal-button"
        >
          {translate("Action.SendAppeal")}
        </Button>
      </div>
    </Fragment>
  );
};

export default SecondChanceActionsCta;
