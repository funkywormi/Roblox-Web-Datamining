import ready from "@rbx/core-scripts/util/ready";
import { addExternal } from "@rbx/externals";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { translations } from "./component.json";
import * as promptsOrchestrator from "./src/inline";
import "./src/main.css";
import { GlobalPrompts } from "./src/global/GlobalPrompts";

addExternal(["Roblox", "PromptsOrchestrator"], { ...promptsOrchestrator });

ready(() => {
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <GlobalPrompts />
    </TranslationProvider>,
    document.getElementById("prompts-orchestrator"),
  );
});
