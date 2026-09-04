import type { SduiPageContext } from "@rbx/sdui-core";
import type { AppPageOrOverlay } from "../constants/pageConstants";

export const getSduiPageContext = (appPage: AppPageOrOverlay): SduiPageContext => {
  return { pageName: appPage, appPage };
};
