import React, {
  createContext,
  ReactChild,
  ReactElement,
  useEffect,
  useReducer,
  useState,
} from "react";
import { TranslateFunction } from "react-utilities";
import { RequestService } from "../../../../common/request";
import { getResources } from "../constants/resources";
import {
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "../interface";
import { EventService } from "../services/eventService";
import { MetricsService } from "../services/metricsService";
import { TurnstileAction, TurnstileActionType } from "./action";
import { TurnstileState } from "./state";
import turnstileStateReducer from "./stateReducer";

export type TurnstileContext = {
  state: TurnstileState;
  dispatch: React.Dispatch<TurnstileAction>;
};

export const TurnstileContext = createContext<TurnstileContext | null>(null);

type Props = {
  challengeId: string;
  // eslint-disable-next-line react/require-default-props
  appType?: string;
  siteKey: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
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
export const TurnstileContextProvider = ({
  challengeId,
  appType,
  siteKey,
  renderInline,
  eventService,
  metricsService,
  requestService,
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
  const [initialState] = useState<TurnstileState>(() => ({
    // Immutable parameters:
    challengeId,
    appType,
    siteKey,
    renderInline,
    // Immutable state:
    resources,
    eventService,
    metricsService,
    requestService,
    onChallengeDisplayed,
    onModalChallengeAbandoned,
    // Mutable state:
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isAbandoned: false,
    // Start parked off-screen (not `display: none`). The widget is mounted
    // immediately so Cloudflare can evaluate without Chromium timer throttling,
    // but the dialog is only revealed for interactive sessions (via
    // `onBeforeInteractive`). Invisible and non-interactive sessions show no UI.
    isModalVisible: false,
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(turnstileStateReducer, initialState);

  /*
   * Effects
   *
   * NOTE: These effects cannot go inside the reducer, since reducers must not
   * have side-effects with respect to the app state.
   */

  // Initialized effect: fire once on mount. The widget is rendered on mount for
  // both inline and modal modes, so this also marks the start of the solve
  // timer.
  useEffect(() => {
    eventService.sendChallengeInitializedEvent();
    metricsService.fireChallengeInitializedEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Displayed effect: fire once when the interactive challenge becomes visible.
  // Invisible and non-interactive sessions never reveal the challenge and
  // therefore never emit this event. Keyed on `isModalVisible` so re-dispatches
  // that keep the flag set do not re-fire it.
  //
  // NOTE: `onChallengeDisplayed` is deliberately called here rather than on
  // mount, so the host is only told the challenge is "displayed" when there is
  // actually something to show (interaction required). This matches the captcha
  // (Arkose) behavior, where invisible / suppressed sessions never notify the
  // host and therefore render no security-prompt UI at all.
  useEffect(() => {
    if (!state.isModalVisible) {
      return;
    }

    eventService.sendChallengeDisplayedEvent();
    metricsService.fireChallengeDisplayedEvent();
    onChallengeDisplayed({ displayed: true });
  }, [state.isModalVisible, eventService, metricsService, onChallengeDisplayed]);

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
    // Ensure that neither the completion nor abandon effect has already fired.
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
    state.isAbandoned,
    onChallengeInvalidated,
  ]);

  // Abandoned effect:
  useEffect(() => {
    // Ensure that neither the completion nor invalidation effect has already
    // fired.
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
          type: TurnstileActionType.SHOW_MODAL_CHALLENGE,
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
    <TurnstileContext.Provider value={{ state, dispatch }}>{children}</TurnstileContext.Provider>
  );
};
