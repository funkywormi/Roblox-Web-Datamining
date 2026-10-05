import React from "react";
import { Loading } from "@rbx/core-ui";
import type { RouteComponentProps } from "react-router-dom";
import GamesOmniFeed from "../gamesPage/GamesOmniFeed";
import ChartsMainPageV2 from "./sduiV2/ChartsMainPageV2";
import useIsChartsSduiV2Enabled from "./sduiV2/chartsSduiV2Experiment";

export type ChartsMainIxpWrapperProps = Parameters<typeof GamesOmniFeed>["0"] & RouteComponentProps;

const ChartsMainIxpWrapper = (routeProps: ChartsMainIxpWrapperProps): React.JSX.Element => {
  const { isEnabled, isLoading } = useIsChartsSduiV2Enabled();

  if (isLoading) {
    return <Loading />;
  }

  return isEnabled ? <ChartsMainPageV2 {...routeProps} /> : <GamesOmniFeed {...routeProps} />;
};

export default ChartsMainIxpWrapper;
