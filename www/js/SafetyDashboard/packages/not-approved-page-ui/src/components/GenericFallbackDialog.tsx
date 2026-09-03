import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { EventTypes } from "../telemetry/analytics";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import useSendNotApprovedPageEvent from "../telemetry/useSendNotApprovedPageEvent";
import makeTranslateWithLink from "../utils/makeTranslateWithLink";

interface GenericFallbackDialogProps {
  /**
   * Impression event fired once on mount. The package supplies
   * `EventTypes.AccountReactivationRedirectRendered` for the
   * self-service-deactivated context; otherwise the value comes from the
   * consumer-supplied `shouldShowGenericFallback` predicate, which may return
   * any `EventTypes` member.
   */
  impressionEvent: EventTypes;
}

/**
 * Generic fallback dialog rendered when the package's decision tree determines
 * that the user should be redirected to Roblox.com instead of being shown the
 * normal moderation dialog.
 *
 * Used primarily on creator-hub surfaces that don't support edge cases scenarios
 * like self-service deactivation or verification flows (VPC / Email).
 */
const GenericFallbackDialog = ({
  impressionEvent,
}: GenericFallbackDialogProps): React.JSX.Element => {
  const { translate, websiteUrl, onLogout } = useNotApprovedUIConfig();
  const sendEvent = useSendNotApprovedPageEvent();
  const translateWithLink = makeTranslateWithLink(translate, sendEvent);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    sendEvent(impressionEvent);
  }, [sendEvent, impressionEvent]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await onLogout();
    },
    onMutate: () => {
      setIsLoggingOut(true);
      sendEvent(EventTypes.LogoutClicked);
    },
    onError: (error: unknown) => {
      // TODO: Track this error with Sentry
      const message = error instanceof Error ? error.message : "Unknown error";
      sendEvent(EventTypes.Error, {
        additionalInfo: `${impressionEvent}: Error logging out - ${message}`,
      });
      setIsLoggingOut(false);
    },
    retry: 0,
  });

  const handleGoToRoblox = () => {
    window.open(websiteUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open isModal size="Medium" hasCloseAffordance={false}>
      <DialogContent className="[&_p]:margin-none [&_h2]:margin-none">
        <DialogBody className="gap-large flex flex-col">
          <DialogTitle className="text-heading-large margin-none">
            {translate("Heading.AccountIssue")}
          </DialogTitle>

          {translateWithLink("Description.ResolveIssue", websiteUrl)}
        </DialogBody>

        <DialogFooter className="flex justify-end gap-small flex-col-reverse medium:flex-row">
          <Button
            variant="Standard"
            size="Medium"
            isLoading={isLoggingOut}
            isDisabled={isLoggingOut}
            onClick={() => {
              logoutMutation.mutate();
            }}
          >
            {translate("Action.Logout")}
          </Button>

          <Button variant="Emphasis" size="Medium" onClick={handleGoToRoblox}>
            {translate("Action.GoToRoblox")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenericFallbackDialog;
