import React, {
  createContext,
  ReactChild,
  ReactElement,
  useEffect,
  useReducer,
  useState,
} from "react";
import { TranslateFunction } from "react-utilities";
import { RequestService } from "../../../common/request";
import { useSessionsQuery } from "../../common/hooks/useSessionsQuery";
import { getResources } from "../constants/resources";
import { SessionManagementAction, SessionManagementActionType } from "./action";
import { SessionManagementState } from "./state";
import sessionManagementStateReducer from "./stateReducer";
import ModalState from "./modalState";
import { collateSessions, separateUnknownSessions, sortSessions } from "../commonHelpers";
import { groupDelaySummaries } from "../constants/delaySummary";
import { EventService } from "../services/eventService";

export type SessionManagementContext = {
  state: SessionManagementState;
  dispatch: React.Dispatch<SessionManagementAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `sessionManagement` web app, containing both the app's state as well
 * as a function to dispatch actions on the state.
 */
export const SessionManagementContext = createContext<SessionManagementContext | null>(
  // The argument passed to `createContext` is supposed to define a default
  // value that gets used if no provider is available in the component tree at
  // the time that `useContext` is called. To avoid runtime errors as a result
  // of forgetting to wrap a subtree with a provider, we use `null` as the
  // default value and test for it whenever global state is accessed.
  null,
);

type Props = {
  eventService: EventService;
  requestService: RequestService;
  numSessionsToDisplay: number;
  userHasConsoleSession: boolean;
  translate: TranslateFunction;
  children: ReactChild;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */
export const SessionManagementContextProvider = ({
  eventService,
  requestService,
  numSessionsToDisplay,
  userHasConsoleSession,
  translate,
  children,
}: Props): ReactElement => {
  const modalState = ModalState.NONE;

  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<SessionManagementState>(() => ({
    // Immutable state:
    resources,
    eventService,
    requestService,

    // Mutable state:
    sessions: [],
    unknownSessions: [],
    hasMore: false,
    nextCursor: "",
    numSessionsToDisplay,
    userHasConsoleSession,
    modalState,
    selectedSession: null,
    delaySummaries: [],
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(sessionManagementStateReducer, initialState);

  const { data: sessionsData } = useSessionsQuery();

  useEffect(() => {
    if (!sessionsData) {
      return;
    }

    const processedSessions = separateUnknownSessions(
      sortSessions(collateSessions(sessionsData.sessions), true),
    );

    const allDelays = sessionsData.sessions.flatMap(s => s.delayLabels ?? []);
    const delaySummaries = groupDelaySummaries(resources, allDelays);

    dispatch({
      type: SessionManagementActionType.SET_SESSIONS,
      sessions: processedSessions.knownSessions,
      unknownSessions: processedSessions.unknownSessions,
      hasMore: sessionsData.hasMore,
      nextCursor: sessionsData.nextCursor,
      delaySummaries,
    });
  }, [sessionsData]);

  // Listen for changes to Props and update state accordingly.
  useEffect(() => {
    dispatch({
      type: SessionManagementActionType.SET_CONSOLE_SESSION_STATUS,
      userHasConsoleSession,
    });
  }, [userHasConsoleSession]);

  return (
    <SessionManagementContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionManagementContext.Provider>
  );
};
