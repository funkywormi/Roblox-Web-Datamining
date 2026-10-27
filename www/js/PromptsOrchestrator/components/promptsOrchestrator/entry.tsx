import ready from "@rbx/core-scripts/util/ready";
import { addExternal } from "@rbx/externals";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import type { Namespace } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { translations } from "./component.json";
import * as promptsOrchestrator from "./src/inline";
import "./src/main.css";
import { GlobalPrompts } from "./src/global/GlobalPrompts";
import { OverlayOrchestrator } from "./src/overlay-orchestrator/OverlayOrchestrator";
import { PROMPTS_ORCHESTRATOR_ID } from "./src/common/constants/websiteConstants";

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const namespaces = translations as unknown as readonly Namespace[];

addExternal(["Roblox", "PromptsOrchestrator"], { ...promptsOrchestrator });

ready(() => {
  renderWithErrorBoundary(
    <TranslationProviderSCC namespaces={namespaces}>
      <TranslationProvider config={translations}>
        <GlobalPrompts />
        <OverlayOrchestrator />
      </TranslationProvider>
    </TranslationProviderSCC>,
    document.getElementById(PROMPTS_ORCHESTRATOR_ID),
  );
});
