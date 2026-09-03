import React, {
  createContext,
  ReactChild,
  ReactElement,
  useMemo,
  useReducer,
  useState,
} from "react";
import { TranslateFunction } from "react-utilities";
import { ForceActionRedirect } from "@rbx/generic-challenge-types";
import { DelayParameters } from "../../twoStepVerification/delay";
import { useMaybeConditionalDynamicBody } from "../app.config";
import { ForceActionRedirectAction } from "./action";
import { ForceActionRedirectState } from "./state";
import forceActionStateReducer from "./stateReducer";

export type ForceActionRedirectContext = {
  state: ForceActionRedirectState;
  dispatch: React.Dispatch<ForceActionRedirectAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `forceAuthenticator` web app, containing both the app's state as well
 * as a function to dispatch actions on the state.
 */
export const ForceActionRedirectContext = createContext<ForceActionRedirectContext | null>(
  // The argument passed to `createContext` is supposed to define a default
  // value that gets used if no provider is available in the component tree at
  // the time that `useContext` is called. To avoid runtime errors as a result
  // of forgetting to wrap a subtree with a provider, we use `null` as the
  // default value and test for it whenever global state is accessed.
  null,
);

type Props = {
  forceActionRedirectChallengeConfig: ForceActionRedirect.ForceActionRedirectChallengeConfig;
  renderInline: boolean;
  translate: TranslateFunction;
  onModalChallengeAbandoned: ForceActionRedirect.OnModalChallengeAbandonedCallback | null;
  onChallengeAbandoned: ForceActionRedirect.OnChallengeAbandonedCallback | null;
  delayParameters?: DelayParameters;
  bodyTranslationKey?: string;
  children: ReactChild;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */
export const ForceActionRedirectContextProvider = ({
  forceActionRedirectChallengeConfig,
  renderInline,
  translate,
  onModalChallengeAbandoned,
  onChallengeAbandoned,
  delayParameters,
  bodyTranslationKey,
  children,
}: Props): ReactElement => {
  const definedKey = bodyTranslationKey ?? "Denied.Body";
  const definedNonEmptyKey = definedKey === "" ? "Denied.Body" : definedKey;
  const dynamicBody = useMaybeConditionalDynamicBody(
    definedNonEmptyKey,
    translate,
    delayParameters,
  );

  // Base resources are computed once; the Body field is overridden reactively
  // by the hook above when trusted session count resolves.
  const [baseResources] = useState(() =>
    forceActionRedirectChallengeConfig.getTranslationResources(translate),
  );
  const resources = useMemo(
    () => ({
      ...baseResources,
      Body: dynamicBody,
    }),
    [baseResources, dynamicBody],
  );

  const [initialState] = useState<ForceActionRedirectState>(() => ({
    // Immutable parameters:
    renderInline,

    // Immutable state:
    resources: baseResources,
    delayParameters,
    redirectURLSignifier: forceActionRedirectChallengeConfig.redirectURLSignifier,
    onModalChallengeAbandoned,
    onChallengeAbandoned,

    // Mutable state:
    isModalVisible: true,
  }));

  // Components will access and mutate state via these variables:
  const [reducerState, dispatch] = useReducer(forceActionStateReducer, initialState);

  // Override resources.Body with the reactive hook result so it updates
  // when the trusted session count resolves.
  const state = useMemo(
    () => ({
      ...reducerState,
      resources,
    }),
    [reducerState, resources],
  );

  return (
    <ForceActionRedirectContext.Provider value={{ state, dispatch }}>
      {children}
    </ForceActionRedirectContext.Provider>
  );
};
