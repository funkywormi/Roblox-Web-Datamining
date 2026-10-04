import { QueryClient } from "@tanstack/react-query";

// Translations: legacy .NET stack. For new code and Next.js migrations, use
// `useTranslations` from `@rbx/www-common/i18n` instead.
// See docs/translation-net-to-nextjs.md.
export type {
  TranslateFunction,
  TranslationConfig,
  WithTranslations,
  WithTranslationsProps,
} from "./intl";
/**
 * @deprecated Use `useTranslations` from `@rbx/www-common/i18n` instead.
 * See docs/translation-net-to-nextjs.md.
 */
export { default as useTranslation } from "./intl/hooks/useTranslation";
/**
 * @deprecated Use `TranslationProviderSCC` from `@rbx/www-common/i18n/scc` (for SCCs)
 * or `TranslationProvider` from `@rbx/www-nextjs/i18n/server` (for Next.js).
 * See docs/translation-net-to-nextjs.md.
 */
export { TranslationProvider } from "./intl/components/TranslationProvider";
/**
 * @deprecated Use `useTranslations` from `@rbx/www-common/i18n` instead.
 * See docs/translation-net-to-nextjs.md.
 */
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
