import "./src/main.css";
import App from "@rbx/products/developerProductDetails";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { ready } from "@rbx/core-scripts/legacy/core-utilities";
import "@rbx/products/css/common/developerProductDetailsPage.scss";

const developerProductDetailsPageContainer = (): HTMLElement | null =>
  document.getElementById('developer-product-details-container');

ready(() => {
  if (developerProductDetailsPageContainer()) {
    renderWithErrorBoundary(<App />, developerProductDetailsPageContainer());
  }
});
