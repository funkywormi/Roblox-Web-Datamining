import { queryClient } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";

import Content from "./components/Content";
import ViewContainer from "./components/ViewContainer";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ViewContainer>
        <Content />
      </ViewContainer>
    </QueryClientProvider>
  );
};

export default App;
