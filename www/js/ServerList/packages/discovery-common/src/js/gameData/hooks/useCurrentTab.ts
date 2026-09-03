import { useEffect, useState } from "react";
import gameDetailTabsMetaData from "../utils/gameDetailTabsMetaData";
import {
  gameDetailHashesToTabs,
  GameDetailsTabs,
  type GameDetailsTab,
} from "../constants/gameDetailConstants";

const { isTabbedView } = gameDetailTabsMetaData;

const getCurrentTab = (): GameDetailsTab | null => {
  if (!isTabbedView()) {
    return null;
  }

  // The about tab is the only one that can be set without a hash.
  // If tabs exist, and there wasn't a hash, we are on the about tab.
  return gameDetailHashesToTabs[window.location.hash] ?? GameDetailsTabs.About;
};

function useCurrentTab(): GameDetailsTab | null {
  const [currentTab, setCurrentTab] = useState<GameDetailsTab | null>(getCurrentTab());

  const onHashChange = () => {
    setCurrentTab(getCurrentTab());
  };

  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return currentTab;
}

export default useCurrentTab;
