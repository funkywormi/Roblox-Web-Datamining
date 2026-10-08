import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@rbx/core-scripts/react";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import type { Namespace } from "@rbx/www-common/i18n";
import AvatarPageContainer from "../containers/AvatarPageContainer";
import { translations as rawTranslations } from "../../component.json";

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const translations = rawTranslations as unknown as readonly Namespace[];

/** *****************************************************************************
 NOTE:
   These mounting functions should only be used if you aren't using React.
   Otherwise, you should render the AvatarPage directly within your app.
****************************************************************************** */

function renderApp() {
  const entryPoint = document.getElementById("avatar-react-container");

  if (entryPoint) {
    render(
      <QueryClientProvider client={queryClient}>
        <TranslationProviderSCC namespaces={translations}>
          <AvatarPageContainer />
        </TranslationProviderSCC>
      </QueryClientProvider>,
      entryPoint,
    );
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(() => {
      renderApp();
    });
  }
}

/*
Tries to mount and render the AvatarPage React component.
*/
function renderAvatarReactComponent(): void {
  renderApp();
}

export function unmountAvatarReactComponent(): void {
  const container = document.getElementById("avatar-react-page");
  if (container) {
    unmountComponentAtNode(container);
  }
}

export default renderAvatarReactComponent;
