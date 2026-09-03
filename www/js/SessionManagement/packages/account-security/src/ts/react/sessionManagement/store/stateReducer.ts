import { collateSessions, separateUnknownSessions, sortSessions } from "../commonHelpers";
import { SessionManagementAction, SessionManagementActionType } from "./action";
import { SessionManagementState } from "./state";

const sessionManagementStateReducer = (
  oldState: SessionManagementState,
  action: SessionManagementAction,
): SessionManagementState => {
  const newState = { ...oldState };
  switch (action.type) {
    case SessionManagementActionType.SET_SESSIONS:
      newState.sessions = action.sessions;
      newState.unknownSessions = action.unknownSessions;
      newState.hasMore = action.hasMore;
      newState.nextCursor = action.nextCursor;
      newState.delaySummaries = action.delaySummaries;
      return newState;

    case SessionManagementActionType.SHOW_MORE:
      newState.numSessionsToDisplay = oldState.numSessionsToDisplay + action.amountToShowMore;
      if (action.sessionsToAdd != null) {
        const processedSessions = separateUnknownSessions(
          sortSessions(collateSessions(action.sessionsToAdd), false),
        );
        newState.sessions = newState.sessions.concat(processedSessions.knownSessions);
        newState.unknownSessions = newState.unknownSessions.concat(
          processedSessions.unknownSessions,
        );
      }
      newState.nextCursor = action.nextCursor;
      newState.hasMore = action.hasMore;
      return newState;

    case SessionManagementActionType.SET_MODAL_STATE:
      newState.modalState = action.modalState;
      newState.selectedSession = action.session;
      return newState;

    case SessionManagementActionType.REMOVE_SESSION: {
      const index = newState.sessions.indexOf(action.session);
      newState.sessions = newState.sessions
        .slice(0, index)
        .concat(newState.sessions.slice(index + 1));
      return newState;
    }

    case SessionManagementActionType.REMOVE_ALL_OTHER_SESSIONS: {
      newState.sessions = newState.sessions.filter(element => element.isCurrentSession);
      newState.unknownSessions = [];
      return newState;
    }

    case SessionManagementActionType.REMOVE_UNKNOWN_SESSIONS: {
      newState.unknownSessions = newState.unknownSessions.filter(
        element => !action.tokensToRemove.has(element.token),
      );
      return newState;
    }

    case SessionManagementActionType.SET_CONSOLE_SESSION_STATUS: {
      newState.userHasConsoleSession = action.userHasConsoleSession;
      return newState;
    }

    default:
      return newState;
  }
};

export default sessionManagementStateReducer;
