// app-bumper is the bottom banner asking you to download the android app and
import { useState, useEffect } from 'react';

export const APP_BUMPER_CONTAINER_CLASS = 'app-bumper-container';

const useAppBumperVisibility = (): boolean => {
  const [isVisible, setIsVisible] = useState(
    () => document.getElementsByClassName(APP_BUMPER_CONTAINER_CLASS).length > 0
  );

  useEffect(() => {
    const appBumper = document.getElementsByClassName(APP_BUMPER_CONTAINER_CLASS)[0];
    if (!appBumper || !appBumper.parentElement) return () => null;

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'childList' &&
          mutation.removedNodes.length > 0 &&
          Array.from(mutation.removedNodes).some(node => node === appBumper)
        ) {
          setIsVisible(false);
          observer.disconnect();
        }
      });
    });

    observer.observe(appBumper.parentElement, { childList: true });
    return () => observer.disconnect();
  }, []);

  return isVisible;
};

export default useAppBumperVisibility;
