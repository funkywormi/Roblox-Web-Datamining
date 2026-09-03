import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TranslationProvider } from "@rbx/core-scripts/react";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import SupportCenterContainer from "./containers/SupportCenterContainer";
import { translations } from "../component.json";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <TranslationProvider config={translations}>
      <QueryClientProvider client={queryClient}>
        <SystemFeedbackProvider>
          <SupportCenterContainer />
        </SystemFeedbackProvider>
      </QueryClientProvider>
    </TranslationProvider>
  );
};

export default App;
