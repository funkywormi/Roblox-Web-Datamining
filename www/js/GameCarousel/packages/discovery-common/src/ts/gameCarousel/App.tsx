import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { withTranslations } from "@rbx/core-scripts/react";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import translations from "./translation.config";
import GamesOmniFeed from "../gamesPage/GamesOmniFeed";
import SortDetailExploreApi from "../sortDetail/exploreApi/SortDetailExploreApi";
import SortDetailV2 from "../sortDetail/SortDetailV2";

const localeRouteRegex = "/:locale([a-z]{2})";

type Props = Parameters<typeof GamesOmniFeed>["0"];

export function ChartsRoutes(props: Props): JSX.Element {
  return (
    <SystemFeedbackProvider>
      <Route exact path="/charts" render={() => <GamesOmniFeed {...props} />} />
      <Route exact path="/charts/:sortName" component={SortDetailExploreApi} />
      <Route exact path="/charts/v2/:sortName" component={SortDetailV2} />
      {/* optional locale prefix */}
      <Route
        exact
        path={`${localeRouteRegex}/charts`}
        render={() => <GamesOmniFeed {...props} />}
      />
      <Route exact path={`${localeRouteRegex}/charts/:sortName`} component={SortDetailExploreApi} />
      <Route exact path={`${localeRouteRegex}/charts/v2/:sortName`} component={SortDetailV2} />
    </SystemFeedbackProvider>
  );
}

function App(props: Props) {
  return (
    <BrowserRouter>
      <ChartsRoutes {...props} />
    </BrowserRouter>
  );
}

export default withTranslations(App, translations);
