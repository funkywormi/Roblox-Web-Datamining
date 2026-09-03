import React from "react";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";
import { ConsoleType } from "../constants/types";

type Props = {
  consoleType: ConsoleType;
};

const ConsoleDisconnect: React.FC<Props> = ({ consoleType }: Props) => {
  const {
    state: { requestService, resources },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Event Handlers
   */

  const disconnectFromXbox = async () => {
    const disconnectXboxResult = await requestService.xbox.disconnectXbox();
    if (disconnectXboxResult.isError) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: resources.Heading.Dialog.DefaultError,
          body: resources.Response.Dialog.DisconnectXBoxError,
          button: resources.Action.Dialog.Success,
        },
      });
    } else {
      dispatch({
        type: SecurityTabActionType.SET_HAS_CONNECTED_XBOX_ACCOUNT,
        hasConnectedXboxAccount: false,
      });
    }
  };
  const disconnectFromPlaystation = async () => {
    const disconnectPlaystationResult = await requestService.playstation.disconnectPlaystation();
    if (disconnectPlaystationResult.isError) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: resources.Heading.Dialog.DefaultError,
          body: resources.Response.Dialog.DisconnectPlayStationError,
          button: resources.Action.Dialog.Success,
        },
      });
    } else {
      dispatch({
        type: SecurityTabActionType.SET_HAS_CONNECTED_PLAYSTATION_ACCOUNT,
        hasConnectedPlaystationAccount: false,
      });
    }
  };

  const unlockPinAndDisconnectFromConsole = async () => {
    switch (consoleType) {
      case ConsoleType.XBOX:
        await disconnectFromXbox();
        return;

      case ConsoleType.PLAYSTATION:
        await disconnectFromPlaystation();
        return;

      default:
        dispatch({
          type: SecurityTabActionType.SET_MODAL_STATE,
          modalState: ModalState.GENERIC_TEXT_ERROR,
          additionalModalProps: {
            title: resources.Heading.Dialog.DefaultError,
            body: resources.Response.Dialog.DefaultErrorMessage,
            button: resources.Action.Dialog.Success,
          },
        });
    }
  };

  /*
   * Component Markup
   */

  const getConsoleHeading = () => {
    switch (consoleType) {
      case ConsoleType.XBOX:
        return resources.Heading.Xbox;

      case ConsoleType.PLAYSTATION:
        return resources.Heading.PlayStation;

      default:
        return "";
    }
  };

  const getConsoleDescription = () => {
    switch (consoleType) {
      case ConsoleType.XBOX:
        return resources.Label.XboxConnected;

      case ConsoleType.PLAYSTATION:
        return resources.Label.PlayStationConnected;

      default:
        return "";
    }
  };

  return (
    <div
      className="section"
      data-testid={`console-disconnect-${consoleType === ConsoleType.XBOX ? "xbox" : "playstation"}`}
    >
      <div className="container-header">
        <h3 className="font-header-2">{getConsoleHeading()}</h3>
      </div>
      <div className="section-content xbox-section">
        <div className="col-sm-12">
          <div className="form-group account-security-settings-container">
            <span className="security-settings-text">{getConsoleDescription()}</span>
            <button
              id="ConsoleDisconnect"
              type="button"
              className="btn-control-sm acct-settings-btn"
              onClick={unlockPinAndDisconnectFromConsole}
            >
              {resources.Action.SocialDisconnect}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleDisconnect;
