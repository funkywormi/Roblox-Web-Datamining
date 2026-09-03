import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderContext } from "./LoaderContext";

type LoadDescriptor = {
  $load: string;
  params?: Record<string, string>;
};

/**
 * Either a static value of type `T` (passed through as-is) or a
 * `$load` descriptor that triggers async resolution via the registry.
 */
type Input<T> = T | LoadDescriptor;

function isLoadDescriptor(item: Input<unknown>): item is LoadDescriptor {
  // eslint-disable-next-line no-implicit-coercion -- Boolean(item) doesn't help with type narrowing
  return !!item && !Array.isArray(item) && typeof item === "object" && "$load" in item;
}

function cacheKey(name: string, params: Record<string, string> | null): string {
  return `${name}::${JSON.stringify(params ?? {})}`;
}

type State<T> =
  | { data: T; loading: false; error: null }
  | { data: null; loading: true; error: null }
  | { data: null; loading: false; error: Error };

type LoaderResult<T> = State<T> & { retry: () => void };

/**
 * Generic hook that resolves a value of type `T` — either synchronously
 * when given a static value, or asynchronously via a named loader from
 * the `LoaderRegistry` when given a `$load` descriptor.
 *
 * Callers consume the result uniformly (data/loading/error) without
 * branching on whether the input is static or async.
 *
 * Results are cached by loader name + params. The cache is cleared when
 * the nearest `LoaderProvider`'s `open` prop transitions to `false`.
 */
export function useLoader<T>(item: Input<T>): LoaderResult<T> {
  const { registryRef, cacheRef } = useLoaderContext();

  const isAsync = isLoadDescriptor(item);

  const params = isAsync ? (item.params ?? null) : null;

  const [state, setState] = useState<State<T>>(() =>
    isAsync
      ? { data: null, loading: true, error: null }
      : { data: item, loading: false, error: null },
  );

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAsync) {
      setState({ data: item, loading: false, error: null });
      return;
    }
    const loaderName = item.$load;
    const loader = registryRef.current[loaderName];
    if (!loader) {
      setState({
        data: null,
        loading: false,
        error: new Error(`Loader "${loaderName}" not found in registry`),
      });
      return;
    }

    const key = cacheKey(loaderName, params);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- cache should match type
    const cached = cacheRef.current.get(key) as T | null;
    if (cached) {
      setState({ data: cached, loading: false, error: null });
      return;
    }

    // TODO: deduplicate in-flight requests for the same key to avoid
    // parallel fetches (e.g. from React strict-mode double-effects or
    // multiple consumers).
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    loader
      .fetch(params ?? {})
      .then(data => {
        if (cancelled) return;
        cacheRef.current.set(key, data);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- data from API
        setState({ data: data as T, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps -- registryRef/cacheRef are stable refs
  }, [params, item, retryCount, isAsync]);

  const retry = useCallback(() => {
    if (!isAsync) return;
    cacheRef.current.delete(cacheKey(item.$load, params));
    setRetryCount(c => c + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cacheRef is a stable ref
  }, [item, params, isAsync]);

  return { ...state, retry } as LoaderResult<T>;
}

/**
 * List-specialized wrapper around {@link useLoader}. Resolves an array
 * via the same static-or-async path, then strips `null`/`undefined`
 * entries from the result.
 */
export const useListLoader = <T extends readonly unknown[]>(
  items: Input<T>,
): LoaderResult<NonNullable<T[number]>[]> => {
  const result = useLoader(items);
  const filteredData = useMemo(() => {
    if (!result.data) return null;
    return result.data.filter((val): val is NonNullable<T[number]> => Boolean(val));
  }, [result.data]);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return { ...result, data: filteredData } as LoaderResult<NonNullable<T[number]>[]>;
};
