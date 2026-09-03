import { QueryClient } from "@tanstack/react-query";

// alternative to `withTranslation` Function. Use `TranslationProvider` to wrap your
// component and access translationPros via `useTranslation` hook.
export type {
  TranslateFunction,
  TranslationConfig,
  WithTranslations,
  WithTranslationsProps,
} from "./intl";
export { default as useTranslation } from "./intl/hooks/useTranslation";
export { TranslationProvider } from "./intl/components/TranslationProvider";
export { default as withTranslations } from "./intl/withTranslations";
export { default as withComponentStatus } from "./componentStatus/withComponentStatus";
export { default as makeActionCreator } from "./redux/makeActionCreator";
export {
  useDebounce,
  useInterval,
  useLocalStorage,
  useOnClickOutside,
  usePrevious,
  useWindowActiveState,
} from "@rbx/react-utilities";
export { default as useTheme } from "./hooks/useTheme";
export { default as useTokens } from "./hooks/useTokens";
export { default as renderWithErrorBoundary } from "./utils/renderWithErrorBoundary";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
