import React from "react";
import { queryClient } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import DeveloperProductsContainer from "./components/DeveloperProductsContainer";

export const GameStore = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <div id="rbx-developer-products" className="container-list game-dev-store game-passes">
        <DeveloperProductsContainer />
      </div>
    </QueryClientProvider>
  );
};

export default GameStore;
