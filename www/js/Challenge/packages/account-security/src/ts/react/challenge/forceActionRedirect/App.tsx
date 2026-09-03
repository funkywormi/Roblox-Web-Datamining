import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { WithTranslationsProps, queryClient } from "react-utilities";
import { ForceActionRedirect as ForceActionRedirectTypes } from "@rbx/generic-challenge-types";
import { DelayParameters } from "../twoStepVerification/delay";
import ForceActionRedirect from "./containers/forceActionRedirect";
import { ForceActionRedirectContextProvider } from "./store/contextProvider";

type Props = {
  forceActionRedirectChallengeConfig: ForceActionRedirectTypes.ForceActionRedirectChallengeConfig;
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
        <ForceActionRedirect />
      </ForceActionRedirectContextProvider>
    </QueryClientProvider>
  );
};

export default App;
