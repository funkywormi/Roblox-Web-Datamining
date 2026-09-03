import React, { useState } from "react";
import { Button, DialogBody, DialogFooter, DialogTitle } from "@rbx/foundation-ui";
import { ModalFragmentProps } from "../../constants/types";
import useSessionManagementContext from "../../hooks/useSessionManagementContext";
import { SessionManagementActionType } from "../../store/action";

const ModalLogOutOfUnknownSessions: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, eventService, requestService, unknownSessions },
    dispatch,
  } = useSessionManagementContext();

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const logOut = async () => {
    setRequestInFlight(true);

    const logOutResults = await Promise.all(
      unknownSessions.map(element => requestService.sessionManagement.logoutSession(element.token)),
    );
    const successfullyLoggedOutSessionTokens = logOutResults.reduce<Set<string>>(
      (set, item, index) => {
        if (!item.isError) {
          eventService.sendSignedOutOfSessionEvent(unknownSessions[index]!.token);
          set.add(unknownSessions[index]!.token);
        }
        return set;
      },
      new Set<string>(),
    );

    dispatch({
      type: SessionManagementActionType.REMOVE_UNKNOWN_SESSIONS,
      tokensToRemove: successfullyLoggedOutSessionTokens,
    });

    if (successfullyLoggedOutSessionTokens.size < unknownSessions.length) {
      setRequestInFlight(false);
      setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
      return;
    }
    setRequestError(null);
    closeModal();
  };

  return (
    <React.Fragment>
      <DialogBody>
        <DialogTitle>{resources.Header.UnknownInfo}</DialogTitle>
        <p className="text-center modal-margin-bottom">
          {resources.Description.OldSessionsWithUnknownData}
        </p>
        <p className="text-error xsmall">{requestError}</p>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="Alert"
          onClick={logOut}
          isDisabled={requestInFlight}
          isLoading={requestInFlight}
        >
          {requestInFlight ? (
            <span className="spinner spinner-xs spinner-no-margin" />
          ) : (
            resources.Action.LogOutOfUnknownSessions
          )}
        </Button>
      </DialogFooter>
    </React.Fragment>
  );
};
export default ModalLogOutOfUnknownSessions;
