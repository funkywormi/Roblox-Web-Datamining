import React from "react";
import {
  Button,
  DialogBody,
  DialogFooter,
  DialogTitle,
  Icon,
  List,
  ListItem,
} from "@rbx/foundation-ui";
import { getDeviceDetails, getLocalizedDateTime, getLocation } from "../../constants/resources";
import { ModalFragmentProps, TokenMetadataItemCollated } from "../../constants/types";
import useSessionManagementContext from "../../hooks/useSessionManagementContext";
import { SessionManagementActionType } from "../../store/action";
import ModalState from "../../store/modalState";
import { getDelaySummariesByState } from "../../constants/delaySummary";

const ModalSessionInfo: React.FC<ModalFragmentProps> = ({ closeModal }: ModalFragmentProps) => {
  const {
    state: { selectedSession, resources },
    dispatch,
  } = useSessionManagementContext();

  const modalLoadError = `${resources.Message.Error.Default} ${resources.Action.PleaseTryAgain}`;
  const XboxOS = "Xbox";
  const PlayStationOS = "PlayStation";

  const showLogOutModal = () => {
    dispatch({
      type: SessionManagementActionType.SET_MODAL_STATE,
      modalState: ModalState.LOG_OUT_CONFIRMATION,
      session: selectedSession,
    });
  };

  const showSecurityDelaysModal = () => {
    dispatch({
      type: SessionManagementActionType.SET_MODAL_STATE,
      modalState: ModalState.SECURITY_DELAYS,
      session: selectedSession,
    });
  };

  const isConsoleSession = (session: TokenMetadataItemCollated | null) => {
    if (session === null || session.agent === null || session.agent.os === null) {
      return false;
    }
    return session.agent.os.includes(XboxOS) || session.agent.os.includes(PlayStationOS);
  };
  const showConsoleDisclaimer = isConsoleSession(selectedSession);

  const hasDelays =
    selectedSession?.delayLabels !== null &&
    selectedSession?.delayLabels?.length &&
    selectedSession.delayLabels.length > 0;

  const maybeDelayExpansionIcon = hasDelays ? (
    <Icon name="icon-regular-chevron-large-right" size="Medium" />
  ) : undefined;
  const maybeShowSecurityDelaysModal = hasDelays ? showSecurityDelaysModal : undefined;

  return (
    <React.Fragment>
      <DialogBody>
        <DialogTitle>{resources.Header.ThisDevice}</DialogTitle>
        {selectedSession === null ? (
          <div className="session-info-section">
            <div className="no-footer">{modalLoadError}</div>
          </div>
        ) : (
          <List>
            <ListItem
              title={resources.Label.DeviceDetails}
              description={getDeviceDetails(resources, selectedSession.agent)}
              divider="Full"
              isContained
            />
            <ListItem
              title={resources.Label.Location}
              description={getLocation(resources, selectedSession.location)}
              divider="Full"
              isContained
            />
            <ListItem
              title={resources.Label.LastActive}
              description={getLocalizedDateTime(
                resources,
                selectedSession.lastAccessedTimestampEpochMilliseconds,
              )}
              divider="Full"
              isContained
            />
            <ListItem
              title={resources.Label.SecurityDelays}
              description={getDelaySummariesByState(resources, selectedSession?.delayLabels ?? [])}
              divider="None"
              trailing={maybeDelayExpansionIcon}
              onSelect={maybeShowSecurityDelaysModal}
              isContained
            />
          </List>
        )}
      </DialogBody>
      {selectedSession !== null && !selectedSession.isCurrentSession && (
        <DialogFooter className="flex flex-col gap-medium">
          {showConsoleDisclaimer && (
            <div className="small">{resources.Description.ConsoleLogoutDisclaimer}</div>
          )}
          <Button variant="Alert" onClick={showLogOutModal}>
            {resources.Action.LogOutOfSession}
          </Button>
        </DialogFooter>
      )}
    </React.Fragment>
  );
};
export default ModalSessionInfo;
