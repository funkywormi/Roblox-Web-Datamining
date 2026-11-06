import React, { createContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { CLOSE_AGE_ESTIMATION_PROMPT_MODAL } from "../actions/actionTypes";

export type AgeEstimationState = { isOpen: boolean };

export type AgeEstimationAction = { type: typeof CLOSE_AGE_ESTIMATION_PROMPT_MODAL };

const initialState: AgeEstimationState = {
  isOpen: true,
};

const AgeEstimationStoreContext = createContext<{
  ageEstimationPromptModalState: AgeEstimationState;
  dispatch: Dispatch<AgeEstimationAction>;
}>({ ageEstimationPromptModalState: initialState, dispatch: () => undefined });

const reducer = (oldState: AgeEstimationState, action: AgeEstimationAction): AgeEstimationState => {
  switch (action.type) {
    case CLOSE_AGE_ESTIMATION_PROMPT_MODAL:
      return {
        ...oldState,
        isOpen: false,
      };
    default:
      return initialState;
  }
};

const AgeEstimationPromptModalStateProvider = ({ children }: { children: ReactNode }) => {
  const [ageEstimationPromptModalState, dispatch] = useReducer(reducer, initialState);
  return (
    <AgeEstimationStoreContext.Provider value={{ ageEstimationPromptModalState, dispatch }}>
      {children}
    </AgeEstimationStoreContext.Provider>
  );
};

export { AgeEstimationPromptModalStateProvider, AgeEstimationStoreContext };
