import React, { createContext, useContext, useEffect, useRef } from "react";

export type ListItemLoader = {
  type: "listItem";
  fetch: (params: Record<string, string>) => Promise<unknown>;
};

export type AnyLoader = ListItemLoader;

export type LoaderRegistry = Record<string, AnyLoader>;

export type LoaderContextValue = {
  registryRef: React.MutableRefObject<LoaderRegistry>;
  cacheRef: React.MutableRefObject<Map<string, unknown>>;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

/**
 * Provides a loader registry and a session-scoped cache to descendant
 * components. The cache is automatically cleared when `open` transitions
 * from `true` to `false`, so each dialog session starts with a clean slate.
 *
 * The context value is ref-stable — consumers of `useLoaderContext` will
 * not re-render when the `loaders` or `open` props change.
 */
export const LoaderProvider = ({
  loaders,
  open,
  children,
}: {
  loaders: LoaderRegistry;
  open: boolean;
  children: React.ReactNode;
}): React.ReactElement => {
  const cacheRef = useRef(new Map<string, unknown>());
  const registryRef = useRef(loaders);
  registryRef.current = loaders;

  useEffect(() => {
    if (!open) {
      cacheRef.current.clear();
    }
  }, [open]);

  // Wrapping in a ref again to get a stable `value`.
  const value = useRef({ registryRef, cacheRef }).current;
  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

/**
 * Returns the loader registry and shared cache from the nearest
 * `<LoaderProvider>`. Throws if called outside the provider.
 */
export const useLoaderContext = (): LoaderContextValue => {
  const ctx = useContext(LoaderContext);
  if (!ctx) {
    throw new Error("useLoaderContext must be used within a <LoaderProvider>");
  }
  return ctx;
};
