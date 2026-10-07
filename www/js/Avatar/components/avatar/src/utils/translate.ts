import { useTranslations, type Namespace } from "@rbx/www-common/i18n";

export type TranslateFn = (key: string, params?: Record<string, string | number | Date>) => string;

export function useAvatarTranslate(ns: Namespace): TranslateFn {
  const t = useTranslations(ns);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- erase CI-generated narrow key types; the avatar component passes translate as (key: string) => string
  return t as unknown as TranslateFn;
}
