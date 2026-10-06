import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { WithTranslationsProps, queryClient } from "react-utilities";
import { ForceActionRedirect as ForceActionRedirectTypes } from "@rbx/generic-challenge-types";
import { DelayParameters } from "../twoStepVerification/delay";
import ForceActionRedirect from "./containers/forceActionRedirect";
import ForcePasswordlessLogin from "./containers/forcePasswordlessLogin";
import { FORCE_PASSWORDLESS_LOGIN_SIGNIFIER, ForceActionRedirectConfig } from "./app.config";
import { ForceActionRedirectContextProvider } from "./store/contextProvider";

type ContainerProps = { translate: ForceActionRedirectTypes.ForceActionRedirectTranslateFunction };

// Challenge types that need more than the informational modal; the rest render ForceActionRedirect.
const containersBySignifier: Partial<Record<string, React.ComponentType<ContainerProps>>> = {
  [FORCE_PASSWORDLESS_LOGIN_SIGNIFIER]: ForcePasswordlessLogin,
};

type Props = {
  forceActionRedirectChallengeConfig: ForceActionRedirectConfig;
  renderInline: boolean;
  onModalChallengeAbandoned: ForceActionRedirectTypes.OnModalChallengeAbandonedCallback | null;
  onChallengeAbandoned: ForceActionRedirectTypes.OnChallengeAbandonedCallback | null;
  delayParameters?: DelayParameters;
  bodyTranslationKey?: string;
} & WithTranslationsProps;

const App: React.FC<Props> = ({
  renderInline,
  forceActionRedirectChallengeConfig,
  translate,
  onModalChallengeAbandoned,
  onChallengeAbandoned,
  delayParameters,
  bodyTranslationKey,
}: Props) => {
  const Container =
    containersBySignifier[forceActionRedirectChallengeConfig.redirectURLSignifier] ??
    ForceActionRedirect;

  return (
    <QueryClientProvider client={queryClient}>
      <ForceActionRedirectContextProvider
        renderInline={renderInline}
        forceActionRedirectChallengeConfig={forceActionRedirectChallengeConfig}
        translate={translate}
        onChallengeAbandoned={onChallengeAbandoned}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
        delayParameters={delayParameters}
        bodyTranslationKey={bodyTranslationKey}
      >
        <Container translate={translate} />
      </ForceActionRedirectContextProvider>
    </QueryClientProvider>
  );
};

export default App;
