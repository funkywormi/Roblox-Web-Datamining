import { getSduiClientPageScope } from "@rbx/sdui-core";

export const CHARTS_HOST_TITLE_FIELD = "hasHostTitle";
export const CHARTS_HOST_TITLE_SELECTOR = "#game-carousel-web-app .header-section h1";

export function hasChartsHostTitle(rootDocument: Document = document): boolean {
  const title = rootDocument.querySelector(CHARTS_HOST_TITLE_SELECTOR);
  return Boolean(title?.textContent?.trim());
}

export function syncChartsClientPageScope(
  configKey: string,
  rootDocument: Document = document,
): void {
  getSduiClientPageScope(configKey).set(CHARTS_HOST_TITLE_FIELD, hasChartsHostTitle(rootDocument));
}
