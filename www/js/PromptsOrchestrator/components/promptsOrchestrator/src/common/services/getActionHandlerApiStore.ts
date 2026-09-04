import { getPageServices } from "@rbx/sdui-core";

// TODO(rychen): Find a better way to break the cyclic dependency.
// Action handlers can't import getSduiApiStore from sduiServices.ts because
// sduiServices imports the registry which imports the handlers — forming a cycle.
// This separate accessor breaks the cycle by importing directly from @rbx/sdui-core.
export const getActionHandlerApiStore = (appPage: string) => {
  return getPageServices(appPage).apiStore;
};
