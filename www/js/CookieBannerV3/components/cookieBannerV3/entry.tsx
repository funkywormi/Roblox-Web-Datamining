import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import bannerConstants from "./src/constants/bannerConstants";
import CookieBannerV3Base from "./src/containers/CookieBannerV3Base";
import "./src/css/cookieBannerV3.scss";

const entryPoint = document.getElementById(bannerConstants.cookieBannerContainerId);

ready(() => {
  if (entryPoint) {
    renderWithErrorBoundary(<CookieBannerV3Base />, entryPoint);
  }
});
