import {
  createSduiClientComponentRegistry,
  getOrCreateSduiClientPageServices,
} from "@rbx/sdui-client";
import type { AppPage } from "../constants/pageConstants";
import { getSduiPageContext } from "../utils/sduiUtils";
import { createPromptsSduiActionHandlerRegistry } from "../registry/createPromptsSduiActionHandlerRegistry";

/**
 * @private purposefully not exported to avoid exposing SDUI services we don't need
 */
const getOrCreateSduiServices = (appPage: AppPage) => {
  return getOrCreateSduiClientPageServices(appPage, {
    pageContext: getSduiPageContext(appPage),
    componentRegistry: createSduiClientComponentRegistry(),
    actionHandlerRegistry: createPromptsSduiActionHandlerRegistry(),
  });
};

export const getSduiApiStore = (appPage: AppPage) => {
  return getOrCreateSduiServices(appPage).apiStore;
};

export const getSduiAnalyticsReporter = (appPage: AppPage) => {
  return getOrCreateSduiServices(appPage).analyticsReporter;
};
