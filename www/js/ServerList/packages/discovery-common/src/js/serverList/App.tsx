import { Fragment, useEffect, useState } from "react";
import type { ElementType } from "react";
import { GameDetailsTabs } from "../gameData/constants/gameDetailConstants";
import useCurrentTab from "../gameData/hooks/useCurrentTab";
import MigrationServerListContainer from "../../ts/serverList/components/MigrationServerListContainer";

type AppProps = {
  sheetComponent?: ElementType;
};

function App({ sheetComponent }: AppProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const currentTab = useCurrentTab();

  // The mobile page for server list doesn't have a horizontal tab bar.
  // We should ensure we are allowing these to display if no tabs are found.
  useEffect(() => {
    // Once we render once, render forever — no need to un-mount when the page hash changes.
    if (!shouldRender) {
      if (currentTab === GameDetailsTabs.GameInstances) {
        setShouldRender(true);
      }
    }
  }, [currentTab, shouldRender]);

  // Conditional rendering / mounting only happens in a tabbed view.
  // If there is not a current tab, we should render the page.
  if (currentTab && !shouldRender) {
    return <Fragment />;
  }

  return <MigrationServerListContainer sheetComponent={sheetComponent} />;
}

export default App;
