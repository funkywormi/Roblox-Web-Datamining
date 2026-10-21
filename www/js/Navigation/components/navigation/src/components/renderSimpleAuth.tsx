// TODO: figure out a better way to do this
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { render } from "react-dom";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { navNamespaces } from "../constants/translationNamespaces";
import { MODAL_CONTAINER_ID } from "../constants/modalConstants";
import { SimpleAuthModal } from "./SimpleAuthModal";

interface RenderSimpleAuthTranslationKeys {
  titleKey?: string;
  bodyContextKey?: string;
  bodyCtaKey?: string;
  buttonKey?: string;
}

export const renderSimpleAuth = (translationKeys: RenderSimpleAuthTranslationKeys = {}) => {
  const container = document.getElementById(MODAL_CONTAINER_ID);
  if (!container) return;

  render(
    <TranslationProviderSCC namespaces={navNamespaces}>
      <SimpleAuthModal {...translationKeys} />
    </TranslationProviderSCC>,
    container,
  );
};
