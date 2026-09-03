import { HashRouter, Switch, Route } from "react-router-dom";
import {
  UniversalFeatureRestrictionsProvider,
  type UniversalFeatureRestrictionsSurfaceProps,
} from "@rbx/universal-feature-restrictions";
import { UniversalFeatureRestrictionDialog } from "@rbx/universal-feature-restrictions/dialog";
import AccountStatusPage from "./pages/AccountStatusPage";
import ViolationsPage from "./pages/ViolationsPage";
import ViolationDetailPage from "./pages/ViolationDetailPage";
import useUniversalFeatureRestrictionsConfig from "./hooks/useUniversalFeatureRestrictionsConfig";
import ScrollToTop from "./shared/components/ScrollToTop";
import ReportInboxPage from "./pages/ReportInboxPage";
import ReportDetailPage from "./pages/ReportDetailPage";

const UniversalFeatureRestrictionsSurface = (props: UniversalFeatureRestrictionsSurfaceProps) => {
  const config = useUniversalFeatureRestrictionsConfig();
  return <UniversalFeatureRestrictionDialog config={config} {...props} />;
};

const App = () => {
  return (
    <UniversalFeatureRestrictionsProvider Surface={UniversalFeatureRestrictionsSurface}>
      <HashRouter>
        <ScrollToTop />
        <Switch>
          <Route exact path="/">
            <AccountStatusPage />
          </Route>
          <Route exact path="/report-inbox">
            <ReportInboxPage />
          </Route>
          <Route path="/report-inbox/:id">
            <ReportDetailPage />
          </Route>
          <Route exact path="/violations">
            <ViolationsPage />
          </Route>
          <Route path="/violations/:id">
            <ViolationDetailPage />
          </Route>
        </Switch>
      </HashRouter>
    </UniversalFeatureRestrictionsProvider>
  );
};

export default App;
