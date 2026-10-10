import React from "react";
import { useHistory } from "react-router";
import { Button } from "@rbx/foundation-ui";
import { mediaTypeToPath } from "../hooks/useActiveMediaType";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";
import { ActionType, MediaType } from "../interface";

type Props = {
  requestInFlight: boolean;
  originalMediaType: MediaType;
  actionType: ActionType;
  className?: string;
};

/**
 * A button to initiate switching the 2SV media type for the current challenge.
 */
const SwitchMediaType: React.FC<Props> = ({
  requestInFlight,
  originalMediaType,
  actionType,
  className,
}: Props) => {
  const {
    state: { renderInline, eventService, resources },
  } = useTwoStepVerificationContext();
  const history = useHistory();

  const clearMediaType = () => {
    eventService.sendTryToSwitchMediaTypeEvent(originalMediaType, actionType);
    history.push(mediaTypeToPath(null));
  };

  const marginBottomClassName = renderInline
    ? "inline-challenge-margin-bottom"
    : "modal-margin-bottom";

  return (
    <Button
      variant="Standard"
      size="Medium"
      className={`challenge-action-button ${marginBottomClassName} ${className ?? ""}`}
      aria-label={resources.Action.ChangeMediaType}
      isDisabled={requestInFlight}
      onClick={clearMediaType}
      data-testid="switch-media-type-button"
    >
      {resources.Action.ChangeMediaType}
    </Button>
  );
};

export default SwitchMediaType;
