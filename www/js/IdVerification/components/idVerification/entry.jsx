import "./src/main.css";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import Roblox from "Roblox";
import App from "@rbx/verification/idVerification/App";
import { rootElementId } from "@rbx/verification/idVerification/app.config";
import {
  getPersonaVerificationStatus,
  getVerifiedAge,
  startVerificationFlow,
  sendIdVerificationEvent,
} from "@rbx/verification/idVerification/services/ageVerificationServices";
import {
  showVoiceOptInOverlay,
  showAvatarVideoOptInOverlay,
} from "@rbx/verification/idVerification/services/voiceChatService";
import { translations } from "./component.json";

Roblox.IdentityVerificationService = {
  getPersonaVerificationStatus,
  getVerifiedAge,
  startVerificationFlow,
  sendIdVerificationEvent,
  showVoiceOptInOverlay,
  showAvatarVideoOptInOverlay,
};

function renderApp() {
  const entryPoint = document.getElementById(rootElementId);
  if (entryPoint) {
    const entryAttr = entryPoint.getAttribute("entry");
    renderWithErrorBoundary(
      <TranslationProviderSCC namespaces={translations}>
        <App entry={entryAttr || undefined} />
      </TranslationProviderSCC>,
      entryPoint,
    );
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  if (rootElementId) {
    renderApp();
  }
});
