import { useEffect } from "react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import "../stylesheets/styleOverrides.scss";

// You are encouraged to neither extend nor re-use this pattern

// This file implements conditional style overrides to modify high level elements
// beyond the scope of this bundle to remove padding, margin and adjust height as needed.
const STYLE_OVERRIDES: string[] = [
  "header-height",
  "rbx-navbar-display",
  "navigation-top",
  "container-main-margin-top",
  "content-padding-top",
];

export function useStyleOverrides(urlSearchParams: URLSearchParams): void {
  useEffect(() => {
    if (getDeviceMeta()?.isInApp) {
      document.documentElement.style.setProperty(
        "--container-main-margin-top",
        "var(--container-main-margin-top-mobile-var",
      );
      // only hide the 2nd row of the header if the user came through a redirect flow
    } else if (urlSearchParams.get("ctx") === "redirect") {
      STYLE_OVERRIDES.forEach(override => {
        document.documentElement.style.setProperty(`--${override}`, `var(--${override}-var`);
      });
    }
  }, [urlSearchParams]);
}
