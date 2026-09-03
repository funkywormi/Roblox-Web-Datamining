import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import TradesListApp from "./src/components/TradesListApp";
import { parseTradesRoute } from "./src/tradesRouter";
import { error as logError, log } from "./src/utils/logger";
import { sendAXError } from "./src/services/tradeEvents";
import "./src/main.css";
import "./src/css/trades.scss";

const mountReactTrades = (): void => {
  const container =
    document.getElementById("trades-web-app") || document.getElementById("trades-container");

  if (!container) {
    logError(
      "No container found for React trades mounting (looked for #trades-web-app / #trades-container).",
    );
    sendAXError("mount", "No container found for React trades mounting");
    return;
  }

  container.classList.add("trades-container");
  log("mounting React trades into", `#${container.id}`, "route:", parseTradesRoute());
  try {
    renderWithErrorBoundary(<TradesListApp />, container);
    log("React trades mounted successfully");
  } catch (err: unknown) {
    logError("React trades failed to mount", err);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    sendAXError("mount", err as Error);
  }
};

ready(mountReactTrades);
