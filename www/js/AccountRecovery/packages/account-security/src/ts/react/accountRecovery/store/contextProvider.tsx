import React, { createContext, ReactChild, ReactElement, useReducer, useState } from "react";
import { TranslateFunction } from "react-utilities";
import { createSystemFeedback } from "react-style-guide";
import { RecoveryState } from "../../../common/request/types/accountRecovery";
import { RequestService } from "../../../common/request";
import { getResources } from "../constants/resources";
import { AccountRecoveryAction } from "./action";
import { AccountRecoveryState } from "./state";
import accountRecoveryStateReducer from "./stateReducer";
import ComponentState from "./componentState";
import ModalState from "./modalState";
import { EventService } from "../services/eventservice";

export type AccountRecoveryContext = {
  state: AccountRecoveryState;
  dispatch: React.Dispatch<AccountRecoveryAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `accountRecovery` web app, containing both the app's state as well
 * as a function to dispatch actions on the state.
 */
export const AccountRecoveryContext = createContext<AccountRecoveryContext | null>(
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
  translate: TranslateFunction;
  children: ReactChild;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */
export const AccountRecoveryContextProvider = ({
  eventService,
  requestService,
  translate,
  children,
}: Props): ReactElement => {
  const recoverySessionState = RecoveryState.AccountIdentifierRequired;
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<AccountRecoveryState>(() => ({
    // Immutable state:
    resources,
    eventService,
    requestService,
    systemFeedbackService,
    SystemFeedback,

    // Mutable state:
    componentStateAndProps: {
      componentState: ComponentState.LOADING,
      additionalComponentProps: null,
    },
    modalStateAndProps: { modalState: ModalState.NONE, additionalModalProps: null },
    recoverySessionState,
    recoverySessionId: "",
    phonePrefixList: [],
    userIdToRecover: null,
    combinedName: null,
    username: null,
    continuingRecovery: false,
    recoverPassword: true,
    recover2sv: false,
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(accountRecoveryStateReducer, initialState);

  return (
    <AccountRecoveryContext.Provider value={{ state, dispatch }}>
      {children}
    </AccountRecoveryContext.Provider>
  );
};
