import { ROOT_ELEMENT_ID } from "../constants";
import { trackCriticalError } from "../observability";
import { BuyRobuxPageData } from "../types/buyRobuxPageData";

export function useBuyRobuxPageData(): BuyRobuxPageData | undefined {
  // it greatly simplifies things if we assert that `buyRobuxPage` is non-null
  // before handing off to BuyRobuxPageContainer
  const container = document.getElementById(ROOT_ELEMENT_ID);
  if (!container) {
    trackCriticalError("NoRoot");
    return;
  }

  const hydratedJson = container.dataset.buyRobuxPage?.trim() ?? "";
  if (!hydratedJson) {
    trackCriticalError("NoPageData");
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return JSON.parse(hydratedJson) as BuyRobuxPageData;
  } catch (error) {
    trackCriticalError("ParsePageDataFailed", null, error);
    return undefined;
  }
}
