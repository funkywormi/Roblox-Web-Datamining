import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useSystemFeedback } from "@rbx/core-ui";
import { getTicketActionRetryDelay, shouldRetryTicketAction } from "../../utils/ticketRetry";

interface TicketAcceptDeclineControlProps {
  acceptText?: string;
  declineText?: string;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
}

const TicketAcceptDeclineControl: React.FC<TicketAcceptDeclineControlProps> = ({
  acceptText,
  declineText,
  onAccept,
  onDecline,
}) => {
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();

  // Surface the failure once, after the shared retry policy is exhausted.
  const showError = () => {
    systemFeedbackService.warning(translate("Response.UnexpectedError"));
  };

  const acceptMutation = useMutation({
    mutationFn: onAccept,
    retry: shouldRetryTicketAction,
    retryDelay: getTicketActionRetryDelay,
    onError: showError,
  });
  const declineMutation = useMutation({
    mutationFn: onDecline,
    retry: shouldRetryTicketAction,
    retryDelay: getTicketActionRetryDelay,
    onError: showError,
  });

  const isPending = acceptMutation.isPending || declineMutation.isPending;

  return (
    <div className="flex items-center gap-small">
      <Button
        variant="Emphasis"
        size="Medium"
        onClick={() => {
          acceptMutation.mutate();
        }}
        isDisabled={isPending}
        isLoading={acceptMutation.isPending}
      >
        {acceptText ?? translate("Action.Accept")}
      </Button>
      <Button
        variant="Standard"
        size="Medium"
        onClick={() => {
          declineMutation.mutate();
        }}
        isDisabled={isPending}
        isLoading={declineMutation.isPending}
      >
        {declineText ?? translate("Action.Decline")}
      </Button>
    </div>
  );
};

export default TicketAcceptDeclineControl;
