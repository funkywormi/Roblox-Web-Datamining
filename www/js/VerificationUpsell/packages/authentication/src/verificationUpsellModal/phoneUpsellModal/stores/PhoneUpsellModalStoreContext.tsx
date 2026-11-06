import React, { createContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { PhonePrefix } from "../../common/types/apiTypes";
import {
  SET_PAGE,
  SET_PHONE_NUMBER,
  SET_COUNTRY,
  SET_ERROR_MESSAGE,
  SET_PHONE_VERIFICATION_STATUS,
  SET_PREFIX_OPTIONS_LIST,
  SET_LOGGING_VALUES,
  SET_DISCOVERABILITY_CONSENT_PREFILL,
  CLOSE_PHONE_NUMBER_MODAL,
} from "../actions/actionTypes";

import { ADD_PHONE_NUMBER_PAGE } from "../constants/pageConstants";
import { originValues } from "../../common/constants/loggingConstants";

export type PhoneUpsellState = {
  isOpen: boolean;
  pageName: string;
  errorMessage: string;
  origin: string;
  phone: string;
  isPhoneVerified: boolean;
  phonePrefixPickerIndex: number;
  phonePrefixOptionsList: PhonePrefix[];
  shouldDiscoverabilityConsentDefaultYes: boolean;
  shouldPrefillAffirmativeDiscoverabilityConsent?: boolean;
};

// A discriminated union rather than one loose shape: the reducer writes action fields straight
// into required state fields, so an optional payload would let a dispatch store undefined.
export type PhoneUpsellAction =
  | { type: typeof SET_PHONE_NUMBER; phone: string }
  | { type: typeof SET_COUNTRY; phonePrefixPickerIndex: number }
  | { type: typeof SET_ERROR_MESSAGE; errorMessage: string }
  | { type: typeof SET_PAGE; pageName: string }
  | { type: typeof SET_PHONE_VERIFICATION_STATUS; isPhoneVerified: boolean }
  | { type: typeof SET_PREFIX_OPTIONS_LIST; phonePrefixOptionsList: PhonePrefix[] }
  | { type: typeof SET_LOGGING_VALUES; origin: string }
  | {
      type: typeof SET_DISCOVERABILITY_CONSENT_PREFILL;
      shouldPrefillAffirmativeDiscoverabilityConsent?: boolean;
    }
  | { type: typeof CLOSE_PHONE_NUMBER_MODAL };

const initialState: PhoneUpsellState = {
  isOpen: true,
  pageName: ADD_PHONE_NUMBER_PAGE,
  errorMessage: "",
  origin: originValues.unset,
  // phone number info
  phone: "",
  isPhoneVerified: false,
  phonePrefixPickerIndex: 0,
  phonePrefixOptionsList: [],
  shouldDiscoverabilityConsentDefaultYes: false,
};

const PhoneUpsellModalStoreContext = createContext<{
  phoneUpsellState: PhoneUpsellState;
  dispatch: Dispatch<PhoneUpsellAction>;
}>({ phoneUpsellState: initialState, dispatch: () => undefined });

const reducer = (oldState: PhoneUpsellState, action: PhoneUpsellAction): PhoneUpsellState => {
  switch (action.type) {
    case SET_PHONE_NUMBER:
      return {
        ...oldState,
        phone: action.phone,
        errorMessage: "",
      };
    case SET_COUNTRY:
      return {
        ...oldState,
        phonePrefixPickerIndex: action.phonePrefixPickerIndex,
        errorMessage: "",
      };
    case SET_ERROR_MESSAGE:
      return {
        ...oldState,
        errorMessage: action.errorMessage,
      };
    case SET_PAGE:
      return {
        ...oldState,
        errorMessage: "",
        pageName: action.pageName,
      };
    case SET_PHONE_VERIFICATION_STATUS:
      return {
        ...oldState,
        isPhoneVerified: action.isPhoneVerified,
      };
    case SET_DISCOVERABILITY_CONSENT_PREFILL:
      return {
        ...oldState,
        shouldPrefillAffirmativeDiscoverabilityConsent:
          action?.shouldPrefillAffirmativeDiscoverabilityConsent ?? false,
      };
    case SET_PREFIX_OPTIONS_LIST:
      return {
        ...oldState,
        phonePrefixOptionsList: action.phonePrefixOptionsList,
      };
    case SET_LOGGING_VALUES:
      return {
        ...oldState,
        origin: action.origin,
      };
    case CLOSE_PHONE_NUMBER_MODAL:
      return {
        ...initialState,
        isOpen: false,
        errorMessage: "",
      };
    default:
      return initialState;
  }
};

const PhoneUpsellModalStateProvider = ({ children }: { children: ReactNode }) => {
  const [phoneUpsellState, dispatch] = useReducer(reducer, initialState);

  return (
    <PhoneUpsellModalStoreContext.Provider value={{ phoneUpsellState, dispatch }}>
      {children}
    </PhoneUpsellModalStoreContext.Provider>
  );
};

export { PhoneUpsellModalStoreContext, PhoneUpsellModalStateProvider };
