import { UniversalFeatureRestrictionsProvider } from "@rbx/universal-feature-restrictions";
import UniversalFeatureRestrictionsSurface from "./components/UniversalFeatureRestrictionsSurface";
import AppContainer from "./containers/AppContainer";

const App = () => (
  <UniversalFeatureRestrictionsProvider Surface={UniversalFeatureRestrictionsSurface}>
    <AppContainer />
  </UniversalFeatureRestrictionsProvider>
);

export default App;
