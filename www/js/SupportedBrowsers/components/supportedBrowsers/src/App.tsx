import { useTranslation } from "@rbx/core-scripts/react";
import type { BrowserDetection } from "./types";
import SupportedBrowsersContainer from "./components/SupportedBrowsersContainer";

interface AppProps {
  readonly browserDetection: BrowserDetection;
}

function App({ browserDetection }: AppProps): JSX.Element {
  const { translate } = useTranslation();
  return <SupportedBrowsersContainer translate={translate} browserDetection={browserDetection} />;
}

export default App;
