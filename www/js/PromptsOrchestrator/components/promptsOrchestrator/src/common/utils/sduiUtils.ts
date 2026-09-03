import type { SduiPageContext } from "@rbx/sdui-core";
import type { AppPage } from "../constants/pageConstants";

export const getSduiPageContext = (appPage: AppPage): SduiPageContext => {
  return { pageName: appPage, appPage };
};
