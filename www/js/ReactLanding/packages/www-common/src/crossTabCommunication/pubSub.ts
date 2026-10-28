// Raw localStorage on purpose: keys and values are a wire format shared with other tabs.
/* eslint-disable no-restricted-globals */

const isLocalStorageEnabled = () => {
  const key = "roblox";
  try {
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const isAvailable = () => isLocalStorageEnabled();

const buildListenerKey = (eventName: string, subscriberNamespace: string) =>
  `${eventName}_${subscriberNamespace}`;

// One storage listener per (eventName, namespace) so subscribe can replace and unsubscribe can
// remove exactly that handler — replacing the selective bind/unbind of jQuery namespaced events.
const listeners = new Map<string, (event: StorageEvent) => void>();

export const subscribe = (
  eventName: string,
  subscriberNamespace: string,
  callback: (newValue: string | null) => void,
) => {
  const listenerKey = buildListenerKey(eventName, subscriberNamespace);
  const existing = listeners.get(listenerKey);
  if (existing) {
    window.removeEventListener("storage", existing);
  }
  const listener = (event: StorageEvent) => {
    if (event.key === eventName) {
      callback(event.newValue);
    }
  };
  listeners.set(listenerKey, listener);
  window.addEventListener("storage", listener);
};

export const unsubscribe = (eventName: string, subscriberNamespace: string) => {
  const listenerKey = buildListenerKey(eventName, subscriberNamespace);
  const existing = listeners.get(listenerKey);
  if (existing) {
    window.removeEventListener("storage", existing);
    listeners.delete(listenerKey);
  }
};

export const publish = (eventName: string, message: string) => {
  localStorage.removeItem(eventName); // For some weird reason, the events are raised only if we delete and set the key again.
  localStorage.setItem(eventName, message);
};
