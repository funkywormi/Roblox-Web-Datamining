import "./src/main.css";
import ready from "@rbx/core-scripts/util/ready";

import { setupInitialLoadReady } from "./src/helpers";

ready(() => {
  setupInitialLoadReady();
});
