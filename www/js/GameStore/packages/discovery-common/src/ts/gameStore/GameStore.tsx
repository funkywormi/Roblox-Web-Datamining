import React from "react";
import { queryClient } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import DeveloperProductsContainer from "./components/DeveloperProductsContainer";
// import GamePasses from './GamePasses';

export const GameStore = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <div id='rbx-game-passes' className='container-list game-dev-store game-passes'> */}
      {/*   <GamePasses />  Note: game passes component looks code complete but it's not. -@jerrylai 9/25/2024 */}
      {/*  <DeveloperProductsContainer/> */}
      {/* </div> */}
      <div id="rbx-developer-products" className="container-list game-dev-store game-passes">
        <DeveloperProductsContainer />
      </div>
    </QueryClientProvider>
  );
};

export default GameStore;
