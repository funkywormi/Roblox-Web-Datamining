import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";

export const signupDownloadModalEventName = "signupDownloadModal";
export const signupDownloadModalContext = "postSignupDownloadModal";

export const sendSignupDownloadModalEvent = (pageUrl: string): void => {
  sendEventWithTarget(
    signupDownloadModalEventName,
    signupDownloadModalContext,
    { shownModal: "SHOWN_MODAL_SUCCESS", url: pageUrl },
    targetTypes.WWW,
  );
};
