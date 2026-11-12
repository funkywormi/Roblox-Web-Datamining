import { useEffect, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { document } from '@rbx/core-lib/browser';

type ModalEntry = { key: number; element: ReactElement };
type Listener = (modals: readonly ModalEntry[]) => void;

let modals: readonly ModalEntry[] = [];
let nextKey = 0;
// Every mounted host subscribes, but only the first renders, so a modal never shows twice.
const hosts: Listener[] = [];
let mountFallbackHost: (() => void) | undefined;

const publish = () => {
  hosts.forEach(listener => listener(modals));
};

/**
 * A place in the host for one modal: `render` shows or updates it, `remove` takes it down. A slot
 * is single-use, so a late `render` (e.g. an async package refetch) can't reopen a closed modal.
 */
export type UpsellModalSlot = {
  render: (element: ReactElement) => void;
  remove: () => void;
};

export function createUpsellModalSlot(): UpsellModalSlot {
  const key = nextKey;
  nextKey += 1;
  let removed = false;
  return {
    render: element => {
      if (removed) {
        return;
      }
      const exists = modals.some(modal => modal.key === key);
      modals = exists
        ? modals.map(modal => (modal.key === key ? { key, element } : modal))
        : [...modals, { key, element }];
      if (hosts.length === 0) {
        mountFallbackHost?.();
      }
      publish();
    },
    remove: () => {
      removed = true;
      if (!modals.some(modal => modal.key === key)) {
        return;
      }
      modals = modals.filter(modal => modal.key !== key);
      publish();
    }
  };
}

/**
 * Lets a page without a React tree of its own (the `.NET` service entry) mount a host the first
 * time a modal opens. A React page renders `<UpsellModalHost />` instead.
 */
export function setUpsellModalHostMounter(mount: () => void): void {
  mountFallbackHost = mount;
}

/**
 * Renders the open upsell modals into `document.body` through a portal, so they sit in the host's
 * React tree and inherit its context (translations included). Works on React 17 and 19.
 */
export function UpsellModalHost(): ReactElement | null {
  const [current, setCurrent] = useState(modals);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const listener: Listener = next => {
      setCurrent(next);
      setIsActive(hosts[0] === listener);
    };
    hosts.push(listener);
    // Catch anything opened between the first render and this effect.
    listener(modals);
    return () => {
      hosts.splice(hosts.indexOf(listener), 1);
      // Hand the modals over to the next host, if there is one.
      publish();
    };
  }, []);

  if (!isActive || current.length === 0 || !document) {
    return null;
  }
  return createPortal(
    current.map(({ key, element }) => <div key={key}>{element}</div>),
    document.body
  );
}
