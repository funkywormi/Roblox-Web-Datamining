import { DeviceMeta, Hybrid } from "Roblox";
import { getQueryParamsFromUrl } from "./navigationUtils";

export const hybridEvents = {
  closeUpdateUsernameModal: "CloseUpdateUsernameModal",
  updateUsernameModalSuccess: "UpdateUsernameModalSuccess",
};

export const initialModalQueryparam = {
  changeUsername: "changeusername",
  changePassword: "changepassword",
};

export const redirectionCheckCompleteEventName = "user-settings-redirection-check-complete";
export const signalRedirectionCheckComplete = (): void => {
  window.dispatchEvent(new CustomEvent(redirectionCheckCompleteEventName));
};

export const hybridNavigation = (eventName: string): void => {
  const isInApp = DeviceMeta && DeviceMeta().isInApp;
  if (isInApp && Hybrid?.Navigation) {
    Hybrid.Navigation.navigateToFeature({
      feature: eventName,
    });
  }
};

// Used to display modals on page load based on query params
export const shouldDisplayInitialModal = (query: string): boolean => {
  const searchParams = getQueryParamsFromUrl(window.location.href);
  return searchParams.has(query);
};
