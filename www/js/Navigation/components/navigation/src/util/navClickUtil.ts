import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";

const NAV_ITEMS: { ids: string[]; navItem: string }[] = [
  { ids: ["nav-logo-link"], navItem: "logo" },
  { ids: ["nav-charts-md-link", "nav-charts-sm-link"], navItem: "charts" },
  { ids: ["nav-marketplace-md-link", "nav-marketplace-sm-link"], navItem: "marketplace" },
  { ids: ["header-develop-md-link", "header-develop-sm-link"], navItem: "create" },
];

export const initNavClickEvents = () => {
  NAV_ITEMS.forEach(({ ids, navItem }) => {
    ids.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("click", () => {
          sendEventWithTarget("navBarClick", "click", { nav_item: navItem }, targetTypes.WWW);
        });
      }
    });
  });
};
