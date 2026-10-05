import React from "react";
import { Route, Router } from "react-router-dom";
import { withTranslations } from "@rbx/core-scripts/react";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import translations from "./translation.config";
import GamesOmniFeed from "../gamesPage/GamesOmniFeed";
import SortDetailV2 from "../sortDetail/SortDetailV2";
import ChartsMainIxpWrapper from "./ChartsMainIxpWrapper";
import ChartsSeeAllIxpWrapper from "./ChartsSeeAllIxpWrapper";
import { chartsHistory, useBindChartsSduiRouter } from "./sduiV2/chartsSduiRouter";

const localeRouteRegex = "/:locale([a-z]{2,3}-[a-z0-9]{2,3}|[a-z]{2})";

type Props = Parameters<typeof GamesOmniFeed>["0"];

export function ChartsRoutes(props: Props): JSX.Element {
  useBindChartsSduiRouter();

  return (
    <SystemFeedbackProvider>
      <Route
        exact
        path={["/charts", `${localeRouteRegex}/charts`]}
        render={routeProps => <ChartsMainIxpWrapper {...props} {...routeProps} />}
      />
      <Route
        exact
        path={["/charts/:sortName", `${localeRouteRegex}/charts/:sortName`]}
        component={ChartsSeeAllIxpWrapper}
      />
      <Route
        exact
        path={["/charts/v2/:sortName", `${localeRouteRegex}/charts/v2/:sortName`]}
        component={SortDetailV2}
      />
    </SystemFeedbackProvider>
  );
}

function App(props: Props) {
  return (
    <Router history={chartsHistory}>
      <ChartsRoutes {...props} />
    </Router>
  );
}

export default withTranslations(App, translations);
