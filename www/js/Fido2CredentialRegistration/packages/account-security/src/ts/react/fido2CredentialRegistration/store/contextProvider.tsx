import React, { createContext, ReactChild, ReactElement, useReducer, useState } from "react";
import { TranslateFunction } from "react-utilities";
import { EventService } from "../services/eventService";
import { Fido2CredentialRegistrationSource } from "../interface";
import { RequestService } from "../../../common/request";
import { Fido2CredentialRegistrationAction } from "./action";
import ModalState from "./modalState";
import { Fido2CredentialRegistrationState } from "./state";
import securityTabStateReducer from "./stateReducer";
import { CredentialPurpose } from "../constants/types";
import { Fido2Credential } from "../../../common/request/types/twoStepVerification";

export type Fido2CredentialRegistrationContext = {
  state: Fido2CredentialRegistrationState;
  dispatch: React.Dispatch<Fido2CredentialRegistrationAction>;
};

export const Fido2CredentialRegistrationContext =
  createContext<Fido2CredentialRegistrationContext | null>(
    // The argument passed to `createContext` is supposed to define a default
    // value that gets used if no provider is available in the component tree at
    // the time that `useContext` is called. To avoid runtime errors as a result
    // of forgetting to wrap a subtree with a provider, we use `null` as the
    // default value and test for it whenever global state is accessed.
    null,
  );

type Props = {
  translate: TranslateFunction;
  eventService: EventService;
  requestService: RequestService;
  onCreationSuccess: () => void;
  onDuplicateCreated: () => void;
  onDeleteSuccess: () => void;
  onLastKeyDeleted: () => void;
  onGenericError: () => void;
  credentialPurpose: CredentialPurpose;
  registeredKeys: Fido2Credential[];
  fido2Supported?: boolean;
  deleteAllPasskeysAllowed?: boolean;
  registrationSource?: Fido2CredentialRegistrationSource;
  children: ReactChild;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */
export const Fido2CredentialRegistrationContextProvider = ({
  translate,
  eventService,
  requestService,
  onCreationSuccess,
  onDuplicateCreated,
  onDeleteSuccess,
  onLastKeyDeleted,
  onGenericError,
  credentialPurpose,
  registeredKeys,
  fido2Supported,
  deleteAllPasskeysAllowed,
  registrationSource,
  children,
}: Props): ReactElement => {
  const [initialState] = useState<Fido2CredentialRegistrationState>(() => ({
    translate,
    eventService,
    requestService,
    onCreationSuccess,
    onDuplicateCreated,
    onDeleteSuccess,
    onLastKeyDeleted,
    onGenericError,
    credentialPurpose,
    registeredKeys,
    fido2Supported,
    deleteAllPasskeysAllowed,
    registrationSource,

    // Mutable state:
    modalStateAndProps: { modalState: ModalState.NONE, additionalModalProps: null },
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(securityTabStateReducer, initialState);

  return (
    <Fido2CredentialRegistrationContext.Provider value={{ state, dispatch }}>
      {children}
    </Fido2CredentialRegistrationContext.Provider>
  );
};

Fido2CredentialRegistrationContextProvider.defaultProps = {
  fido2Supported: undefined,
  deleteAllPasskeysAllowed: true,
  registrationSource: undefined,
};
