import { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

/**
 * Resolves the inverse theme class by inspecting `<body>` and `<html>` for an
 * explicit theme class (`dark-theme`, `light-theme`, `system-theme`). Also
 * listens for changes to the theme class on the document body and document element.
 *
 * Roblox www uses classname on the body element, creator hub uses classname on the html element.
 */
export default function useInverseThemeClass(): string {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const detectInverse = useCallback((): string => {
    if (typeof document === 'undefined') {
      return prefersDark ? 'light-theme' : 'dark-theme';
    }

    const themeEl = [document.body, document.documentElement].find(
      el =>
        el.classList.contains('dark-theme') ||
        el.classList.contains('light-theme') ||
        el.classList.contains('system-theme')
    );

    if (themeEl?.classList.contains('dark-theme')) return 'light-theme';
    if (themeEl?.classList.contains('light-theme')) return 'dark-theme';
    if (themeEl?.classList.contains('system-theme'))
      return prefersDark ? 'light-theme' : 'dark-theme';

    // No explicit theme class; :root CSS defaults to light-like tokens,
    // but @media (prefers-color-scheme: dark) overrides them for system-dark.
    return prefersDark ? 'light-theme' : 'dark-theme';
  }, [prefersDark]);

  const [inverseClass, setInverseClass] = useState(detectInverse);

  useEffect(() => {
    // Re-detect now that all effects (including parent decorators) have fired.
    setInverseClass(detectInverse());

    if (typeof MutationObserver === 'undefined') {
      return undefined;
    }

    const observer = new MutationObserver(() => {
      setInverseClass(detectInverse());
    });

    const observeOpts: MutationObserverInit = { attributes: true, attributeFilter: ['class'] };
    observer.observe(document.documentElement, observeOpts);
    observer.observe(document.body, observeOpts);

    return () => {
      observer.disconnect();
    };
  }, [detectInverse]);

  return inverseClass;
}
