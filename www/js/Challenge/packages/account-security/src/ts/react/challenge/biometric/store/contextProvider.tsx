import React, {
  createContext,
  ReactChild,
  ReactElement,
  useState,
  useReducer,
  useEffect,
} from "react";
import { TranslateFunction } from "react-utilities";
import { BiometricAction } from "./action";
import { BiometricState } from "./state";
import {
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "../interface";
import { getResources } from "../constants/resources";
import { EventService } from "../services/eventService";
import { MetricsService } from "../services/metricsService";
import biometricStateReducer from "./stateReducer";

export type BiometricContext = {
  state: BiometricState;
  dispatch: React.Dispatch<BiometricAction>;
};

export const BiometricContext = createContext<BiometricContext | null>(null);

type Props = {
  challengeId: string;
  biometricType: string;
  appType?: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  translate: TranslateFunction;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
  children: ReactChild;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */

export const BiometricContextProvider = ({
  challengeId,
  biometricType,
  appType,
  renderInline,
  eventService,
  metricsService,
  translate,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
  children,
}: Props): ReactElement => {
  // We declare these variables as lazy-initialized state variables since they
  // do not need to be re-computed if this component re-renders.
  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<BiometricState>(() => ({
    // Immutable parameters
    challengeId,
    biometricType,
    appType,
    renderInline,
    // Immutable state
    resources,
    eventService,
    metricsService,
    onChallengeDisplayed,
    onModalChallengeAbandoned,
    // Mutable state
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    onChallengeAbandonedData: null,
  }));
  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(biometricStateReducer, initialState);

  // Effects
  useEffect(() => {
    // Ensure that invalidation or abandoned effect has not already fired.
    if (
      state.onChallengeCompletedData === null ||
      state.onChallengeInvalidatedData !== null ||
      state.onChallengeAbandonedData !== null
    ) {
      return;
    }

    // Send events
    eventService.sendChallengeCompletedEvent(
      state.onChallengeCompletedData.reason,
      state.onChallengeCompletedData.inquiryId,
    );
    metricsService.fireChallengeCompletedEvent(state.onChallengeCompletedData.reason);

    onChallengeCompleted(state.onChallengeCompletedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    state.onChallengeAbandonedData,
    onChallengeCompleted,
  ]);

  useEffect(() => {
    // Ensure that completion or abandoned effect has not already fired.
    if (
      state.onChallengeCompletedData !== null ||
      state.onChallengeInvalidatedData === null ||
      state.onChallengeAbandonedData !== null
    ) {
      return;
    }

    // Send events
    eventService.sendChallengeInvalidatedEvent(
      state.onChallengeInvalidatedData.reason,
      state.onChallengeInvalidatedData.inquiryId,
    );
    metricsService.fireChallengeInvalidatedEvent(state.onChallengeInvalidatedData.reason);

    onChallengeInvalidated(state.onChallengeInvalidatedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    state.onChallengeAbandonedData,
    onChallengeInvalidated,
  ]);

  useEffect(() => {
    // Ensure that completion or invalidated effect has not already fired.
    if (
      state.onChallengeCompletedData !== null ||
      state.onChallengeInvalidatedData !== null ||
      state.onChallengeAbandonedData === null
    ) {
      return;
    }

    // Send events
    eventService.sendChallengeAbandonedEvent(
      state.onChallengeAbandonedData.reason,
      state.onChallengeAbandonedData.inquiryId,
    );
    metricsService.fireChallengeAbandonedEvent(state.onChallengeAbandonedData.reason);

    if (onModalChallengeAbandoned !== null) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onModalChallengeAbandoned(() => {});
    }
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    state.onChallengeAbandonedData,
    onModalChallengeAbandoned,
  ]);

  return (
    <BiometricContext.Provider value={{ state, dispatch }}>{children}</BiometricContext.Provider>
  );
};
