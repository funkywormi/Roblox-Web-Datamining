import "./src/main.css";
import React from "react";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import ItemDetailsContainer from "@rbx/catalog/itemDetails/containers/ItemDetailsContainer";
import itemDetailsConstants from "@rbx/catalog/itemDetails/constants/itemDetailsConstants";
import "@rbx/catalog/css/itemDetails/itemDetails.scss";

// The server renders this id and the Angular entry bootstrapped onto it.
ready(() => {
  const containerElement = document.getElementById(itemDetailsConstants.containerId);
  if (containerElement) {
    renderWithErrorBoundary(<ItemDetailsContainer />, containerElement);
  }
});
