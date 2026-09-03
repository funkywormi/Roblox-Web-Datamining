import React, { useState } from "react";
import { cryptoUtil } from "core-roblox-utilities";
import { Button, DialogBody, DialogFooter, DialogTitle } from "@rbx/foundation-ui";
import { ModalFragmentProps } from "../../constants/types";
import useSessionManagementContext from "../../hooks/useSessionManagementContext";
import { SessionManagementActionType } from "../../store/action";

const { generateSecureAuthIntentV2 } = cryptoUtil;

const ModalLogOutOfAllSessions: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, eventService, requestService },
    dispatch,
  } = useSessionManagementContext();

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const logOut = async () => {
    setRequestInFlight(true);
    const signOutResult =
      await requestService.sessionManagement.logoutFromAllSessionsAndReauthenticate(
        await generateSecureAuthIntentV2(),
      );
    if (signOutResult.isError) {
      setRequestInFlight(false);
      setRequestError(`${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`);
    } else {
      eventService.sendSignedOutOfAllSessionsEvent();
      setRequestError(null);
      dispatch({
        type: SessionManagementActionType.REMOVE_ALL_OTHER_SESSIONS,
      });
    }
    closeModal();
  };

  return (
    <React.Fragment>
      <DialogBody>
        <DialogTitle>{resources.Header.LogOutAllSessions}</DialogTitle>
        <p className="modal-margin-bottom">{resources.Description.YouWillBeLoggedOutAllSessions}</p>
        <p className="text-error xsmall">{requestError}</p>
      </DialogBody>
      <DialogFooter className="flex gap-medium">
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

export default ModalLogOutOfAllSessions;
