import React, { useState } from "react";
import { Button, DialogBody, DialogFooter, DialogTitle } from "@rbx/foundation-ui";
import { ModalFragmentProps } from "../../constants/types";
import useSessionManagementContext from "../../hooks/useSessionManagementContext";
import { SessionManagementActionType } from "../../store/action";

const ModalLogOutConfirmation: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, eventService, requestService, selectedSession, hasMore, nextCursor },
    dispatch,
  } = useSessionManagementContext();

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const logOut = async () => {
    setRequestInFlight(true);

    if (selectedSession === null) {
      setRequestInFlight(false);
      setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
      return;
    }

    const logOutResult = await requestService.sessionManagement.logoutSession(
      selectedSession.token,
    );
    if (logOutResult.isError) {
      setRequestInFlight(false);
      setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
      return;
    }

    eventService.sendSignedOutOfSessionEvent(selectedSession.token);
    dispatch({
      type: SessionManagementActionType.REMOVE_SESSION,
      session: selectedSession,
    });

    if (selectedSession.parent != null) {
      const logOutParentResult = await requestService.sessionManagement.logoutSession(
        selectedSession.parent.token,
      );
      if (logOutParentResult.isError) {
        // Display parent session if logging it out fails but child is
        // successfully logged out.
        dispatch({
          type: SessionManagementActionType.SHOW_MORE,
          hasMore,
          nextCursor,
          sessionsToAdd: [selectedSession.parent],
          amountToShowMore: 0,
        });
      } else {
        eventService.sendSignedOutOfSessionEvent(selectedSession.parent.token);
      }
    }
    setRequestError(null);
    closeModal();
  };

  return (
    <React.Fragment>
      <DialogBody>
        <DialogTitle>{resources.Header.LogOutOfSession}</DialogTitle>
        <p className="text-center modal-margin-bottom">
          {resources.Description.YouWillBeLoggedOut}
        </p>
        <p className="text-error xsmall">{requestError}</p>
      </DialogBody>
      <DialogFooter className="flex gap-medium justify-center">
        <Button
          variant="Standard"
          onClick={closeModal}
          isDisabled={requestInFlight}
          isLoading={requestInFlight}
          size="Large"
          className="flex-col fill"
        >
          {resources.Action.Cancel}
        </Button>
        <Button
          variant="Alert"
          onClick={logOut}
          isDisabled={requestInFlight}
          isLoading={requestInFlight}
          size="Large"
          className="flex-col fill"
        >
          {requestInFlight ? (
            <span className="spinner spinner-xs spinner-no-margin" />
          ) : (
            resources.Action.LogOut
          )}
        </Button>
      </DialogFooter>
    </React.Fragment>
  );
};
export default ModalLogOutConfirmation;
