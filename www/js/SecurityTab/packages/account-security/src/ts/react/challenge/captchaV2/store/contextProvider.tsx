import React, {
  createContext,
  ReactChild,
  ReactElement,
  useEffect,
  useReducer,
  useState,
} from "react";
import { RequestService } from "../../../../common/request";
import {
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "../interface";
import { EventService } from "../services/eventService";
import { MetricsService } from "../services/metricsService";
import { CaptchaV2Action, CaptchaV2ActionType } from "./action";
import { CaptchaV2State } from "./state";
import captchaV2StateReducer from "./stateReducer";

export type CaptchaV2Context = {
  state: CaptchaV2State;
  dispatch: React.Dispatch<CaptchaV2Action>;
};

export const CaptchaV2Context = createContext<CaptchaV2Context | null>(null);

type Props = {
  challengeId: string;
  // eslint-disable-next-line react/require-default-props
  appType?: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
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
export const CaptchaV2ContextProvider = ({
  challengeId,
  appType,
  renderInline,
  eventService,
  metricsService,
  requestService,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
  children,
}: Props): ReactElement => {
  // We declare these variables as lazy-initialized state variables since they
  // do not need to be re-computed if this component re-renders.
  const [initialState] = useState<CaptchaV2State>(() => ({
    // Immutable parameters:
    challengeId,
    appType,
    renderInline,
    // Immutable state:
    eventService,
    metricsService,
    requestService,
    onChallengeDisplayed,
    onModalChallengeAbandoned,
    // Mutable state:
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isAbandoned: false,
    isModalVisible: false,
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(captchaV2StateReducer, initialState);

  /*
   * Effects
   *
   * NOTE: These effects cannot go inside the reducer, since reducers must not
   * have side-effects with respect to the app state.
   */

  // Displayed effect: fire once when the interactive challenge becomes visible.
  // Keyed on `isModalVisible` so repeated 403s (which re-dispatch
  // SHOW_MODAL_CHALLENGE without changing the flag) do not re-fire it.
  useEffect(() => {
    if (!state.isModalVisible) {
      return;
    }

    onChallengeDisplayed({ displayed: true });
    eventService.sendChallengeDisplayedEvent();
    metricsService.fireChallengeDisplayedEvent();
  }, [state.isModalVisible, onChallengeDisplayed, eventService, metricsService]);

  // Completion effect:
  useEffect(() => {
    // Ensure that invalidation effect has not already fired.
    if (state.onChallengeCompletedData === null || state.onChallengeInvalidatedData !== null) {
      return;
    }

    eventService.sendChallengeCompletedEvent();
    metricsService.fireChallengeCompletedEvent();

    onChallengeCompleted(state.onChallengeCompletedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeCompleted,
  ]);

  // Invalidation effect:
  useEffect(() => {
    // Ensure that completion effect has not already fired.
    if (
      state.isAbandoned ||
      state.onChallengeInvalidatedData === null ||
      state.onChallengeCompletedData !== null
    ) {
      return;
    }

    eventService.sendChallengeInvalidatedEvent();
    metricsService.fireChallengeInvalidatedEvent();

    onChallengeInvalidated(state.onChallengeInvalidatedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeInvalidated,
    state.isAbandoned,
  ]);

  // Abandoned effect:
  useEffect(() => {
    // Ensure that completion effect has not already fired.
    if (
      !state.isAbandoned ||
      state.onChallengeCompletedData !== null ||
      state.onChallengeInvalidatedData !== null
    ) {
      return;
    }

    eventService.sendChallengeAbandonedEvent();
    metricsService.fireChallengeAbandonedEvent();

    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: CaptchaV2ActionType.SHOW_MODAL_CHALLENGE,
        }),
      );
    }
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    state.isAbandoned,
    onModalChallengeAbandoned,
  ]);

  return (
    <CaptchaV2Context.Provider value={{ state, dispatch }}>{children}</CaptchaV2Context.Provider>
  );
};
