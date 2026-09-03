import React from "react";
import { Chip, Icon, ListItem } from "@rbx/foundation-ui";
import {
  getDeviceDetails,
  getLocalizedDateTime,
  getLocation,
  SessionManagementResources,
} from "../constants/resources";
import { TokenMetadataItemCollated } from "../constants/types";
import useSessionManagementContext from "../hooks/useSessionManagementContext";
import { SessionManagementActionType } from "../store/action";
import ModalState from "../store/modalState";

export type SessionRowProps = {
  session: TokenMetadataItemCollated;
  isLastSessionToDisplay: boolean;
};

export const getSessionTitle = (
  resources: SessionManagementResources,
  agent: TokenMetadataItemCollated["agent"],
): string => getDeviceDetails(resources, agent);

export const getSessionMetadata = (
  resources: SessionManagementResources,
  session: TokenMetadataItemCollated,
): string =>
  session.isCurrentSession
    ? resources.Label.Value.ThisSession
    : getLocation(resources, session.location);

export const getSessionDescription = (
  resources: SessionManagementResources,
  session: TokenMetadataItemCollated,
): string =>
  session.isCurrentSession
    ? // Foundation elements don't handle min-height well so we keep a consistent height
      // by always adding padding text.
      resources.Label.Value.JustNow
    : getLocalizedDateTime(resources, session.lastAccessedTimestampEpochMilliseconds);

const SessionRow: React.FC<SessionRowProps> = ({ session }) => {
  const {
    state: { resources, eventService },
    dispatch,
  } = useSessionManagementContext();

  const showSessionInfoModal = () => {
    eventService.sendOpenedSessionDetailsEvent(session.token);
    dispatch({
      type: SessionManagementActionType.SET_MODAL_STATE,
      modalState: ModalState.SESSION_INFO,
      session,
    });
  };

  return (
    <ListItem
      title={getSessionTitle(resources, session.agent)}
      metadata={getSessionMetadata(resources, session)}
      description={getSessionDescription(resources, session)}
      divider="Full"
      isContained
      onSelect={showSessionInfoModal}
      trailing={
        <span className="flex items-center gap-small">
          {session.isTrustedSession && (
            <Chip
              as="button"
              isChecked={false}
              size="Small"
              text={resources.Label.Value.Trusted}
              variant="Standard"
            />
          )}
          {session.delayLabels && session.delayLabels.length > 0 && (
            <Chip
              as="button"
              isChecked={false}
              size="Small"
              text={`${session.delayLabels.length} ${resources.Label.DelayLowercase}`}
              variant="Standard"
            />
          )}
          <Icon name="icon-regular-chevron-large-right" size="Medium" />
        </span>
      }
      className="padding-y-large"
    />
  );
};

export default SessionRow;
