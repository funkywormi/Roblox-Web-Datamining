import "./src/main.css";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { PageNameProvider } from "@rbx/core-scripts/util/page-name";
import "@rbx/sponsored-pages/jquery/giftcards";
import App from "./src/App";

PageNameProvider.setInternalPageName("GiftCards");

ready(() => {
  const container =
    document.getElementById("SponsoredPageContent") ??
    document.getElementById("gift-cards-container");
  if (container) {
    renderWithErrorBoundary(<App />, container);
  }
});
