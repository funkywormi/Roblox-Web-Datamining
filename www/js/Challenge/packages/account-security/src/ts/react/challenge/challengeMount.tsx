import type { ReactElement } from "react";
import * as ReactDOM from "react-dom";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import type { Namespace } from "@rbx/www-common/i18n";

export type ChallengeMounter = {
  mount: (container: Element, app: ReactElement, namespaces: readonly Namespace[]) => void;
  unmount: (container: Element) => void;
};

type LegacyReactDom = {
  render: (element: ReactElement, container: Element) => void;
  unmountComponentAtNode: (container: Element) => boolean;
};

// React 19 removed these, so Next installs its own mounter.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const legacyReactDom = ReactDOM as unknown as LegacyReactDom;

const legacyMounter: ChallengeMounter = {
  mount: (container, app, namespaces) => {
    legacyReactDom.render(
      <TranslationProviderSCC namespaces={namespaces}>{app}</TranslationProviderSCC>,
      container,
    );
  },
  unmount: container => {
    legacyReactDom.unmountComponentAtNode(container);
  },
};

let currentMounter = legacyMounter;

export const setChallengeMounter = (mounter: ChallengeMounter): void => {
  currentMounter = mounter;
};

export const mountChallenge: ChallengeMounter["mount"] = (container, app, namespaces) => {
  currentMounter.mount(container, app, namespaces);
};

export const unmountChallenge: ChallengeMounter["unmount"] = container => {
  currentMounter.unmount(container);
};
