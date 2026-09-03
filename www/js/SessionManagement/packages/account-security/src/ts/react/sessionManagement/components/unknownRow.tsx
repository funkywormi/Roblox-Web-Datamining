import classNames from "classnames";
import React from "react";
import useSessionManagementContext from "../hooks/useSessionManagementContext";
import { SessionManagementActionType } from "../store/action";
import ModalState from "../store/modalState";

const placeholder = "";

type Props = {
  isLastSessionToDisplay: boolean;
};

const UnknownRow: React.FC<Props> = ({ isLastSessionToDisplay }: Props) => {
  const {
    state: { resources, unknownSessions },
    dispatch,
  } = useSessionManagementContext();

  const showSessionInfoModal = () => {
    dispatch({
      type: SessionManagementActionType.SET_MODAL_STATE,
      modalState: ModalState.LOG_OUT_OF_UNKNOWN_SESSIONS,
      session: null,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      showSessionInfoModal();
    }
  };

  const dividerClassName = classNames("rbx-divider text-new-line", {
    "last-divider": isLastSessionToDisplay,
  });

  const unknownRowContents = (): React.ReactFragment => {
    return (
      <React.Fragment>
        <div className="text-description location-description">
          <div>&nbsp;</div>
        </div>
        <span
          className="unknown-sessions icon-moreinfo"
          role="button"
          onClick={showSessionInfoModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {placeholder}
        </span>
        <div>{resources.Label.Value.UnknownWithCount(unknownSessions.length)}</div>
        <div className="text-description text-new-line">
          <div>&nbsp;</div>
        </div>
        <div className={dividerClassName} />
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <div
        className="session-row-narrow"
        role="button"
        onClick={showSessionInfoModal}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {unknownRowContents()}
      </div>
      <div className="session-row-wide">{unknownRowContents()}</div>
    </React.Fragment>
  );
};

export default UnknownRow;
