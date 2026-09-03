import { gameDetailTabs } from "../constants/gameDetailConstants";

const isTabbedView = () => {
  const gameDetailTabsElement = document.getElementById("horizontal-tabs");
  if (gameDetailTabsElement) {
    try {
      gameDetailTabs.forEach(tabId => {
        if (!gameDetailTabsElement.querySelector(`#${tabId}`)) {
          throw new Error(`Unable to find horizontal tab with id ${tabId}`);
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error instanceof Error ? error.message : String(error));
      return false;
    }

    // If each of the expected tabs exist, we can consider this our tabbed view
    return true;
  }
  return false;
};

export default {
  isTabbedView,
};
