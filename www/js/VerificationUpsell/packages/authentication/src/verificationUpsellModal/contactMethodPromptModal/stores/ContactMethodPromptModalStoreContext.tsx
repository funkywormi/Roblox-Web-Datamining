import React, { createContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { CLOSE_CONTACT_METHOD_PROMPT_MODAL, SET_LOGGING_VALUES } from "../actions/actionTypes";

export type ContactMethodPromptState = { isOpen: boolean; origin: string; section: string };

export type ContactMethodPromptAction =
  | { type: typeof CLOSE_CONTACT_METHOD_PROMPT_MODAL }
  | { type: typeof SET_LOGGING_VALUES; origin: string; section: string };

const initialState: ContactMethodPromptState = {
  isOpen: true,
  origin: "",
  section: "",
};

const ContactMethodPromptModalStoreContext = createContext<{
  contactMethodPromptModalState: ContactMethodPromptState;
  dispatch: Dispatch<ContactMethodPromptAction>;
}>({ contactMethodPromptModalState: initialState, dispatch: () => undefined });

const reducer = (
  oldState: ContactMethodPromptState,
  action: ContactMethodPromptAction,
): ContactMethodPromptState => {
  switch (action.type) {
    case CLOSE_CONTACT_METHOD_PROMPT_MODAL:
      return {
        ...oldState,
        isOpen: false,
      };
    case SET_LOGGING_VALUES:
      return {
        ...oldState,
        origin: action.origin,
        section: action.section,
      };
    default:
      return initialState;
  }
};

const ContactMethodPromptModalStateProvider = ({ children }: { children: ReactNode }) => {
  const [contactMethodPromptModalState, dispatch] = useReducer(reducer, initialState);

  return (
    <ContactMethodPromptModalStoreContext.Provider
      value={{ contactMethodPromptModalState, dispatch }}
    >
      {children}
    </ContactMethodPromptModalStoreContext.Provider>
  );
};

export { ContactMethodPromptModalStoreContext, ContactMethodPromptModalStateProvider };
