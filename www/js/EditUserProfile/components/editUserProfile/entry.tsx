import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import EditUserProfileContainer from "./src/EditUserProfileContainer";
import { translations } from "./component.json";
import "./src/main.css";

const queryClient = new QueryClient();

ready(() => {
  renderWithErrorBoundary(
    <QueryClientProvider client={queryClient}>
      <TranslationProvider config={translations}>
        <SystemFeedbackProvider>
          {/* Import ExperimentsProvider from @rbx/profile-common when we need to experiment again. */}
          {/* <ExperimentsProvider layer={ExperimentationLayer.SocialProfile}> */}
          <EditUserProfileContainer />
          {/* </ExperimentsProvider> */}
        </SystemFeedbackProvider>
      </TranslationProvider>
    </QueryClientProvider>,
    document.getElementById("edit-user-profile-web-app"),
  );
});
