import React from "react";
import { SUPPORT_FORM_URL } from "../../shared/url";
import { sendSupportClickEvent } from "../../telemetry/appealsEvents";

/**
 * A rough check if the user intends to open the link a new tab etc.
 */
const isModifiedEvent = (event: React.MouseEvent<HTMLAnchorElement>) =>
  event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button === 1;

/**
 * We want to capture clicks to the support page.
 * Unfortunately, there is no good analytics solution to tap into that supports
 * navigator.sendBeacon(), so we add a small delay to allow the event tracking to
 * happen.
 */
export const onSupportClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
  sendSupportClickEvent("SupportForm");
  if (!isModifiedEvent(event)) {
    event.preventDefault();
    // Small delay to allow the event to be sent
    setTimeout(() => {
      window.location.href = SUPPORT_FORM_URL;
    }, 100);
  }
};
