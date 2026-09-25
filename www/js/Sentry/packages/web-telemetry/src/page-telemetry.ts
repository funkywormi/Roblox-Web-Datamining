import { trackPageView } from "./pageViewTracking";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", trackPageView);
} else {
  trackPageView();
}
