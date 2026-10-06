import { useMemo } from "react";
import { useTranslations, type Namespace } from "@rbx/www-common/i18n";

/** Legacy `translate` signature: bare keys looked up across every chat namespace. */
export type TChatTranslate = (
  key: string,
  params?: Record<string, unknown>,
  fallback?: string,
) => string;

type TLooseTranslator = {
  (key: string, values?: Record<string, unknown>): string;
  has: (key: string) => boolean;
};

// CI narrows `Namespace` to the Next.js locale catalogue, which omits most chat namespaces.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- valid at runtime via component.json
const asNamespace = (name: string): Namespace => name as unknown as Namespace;

/**
 * `component.json` `translations`, highest precedence first. The legacy provider merged them with
 * later entries winning, so this is that list reversed. Keep in sync with the hook calls below.
 */
export const CHAT_NAMESPACES_BY_PRECEDENCE = [
  "Feature.RobloxSubscription",
  "CommonUI.Messages",
  "CommonUI.Controls",
  "AccountIdentity.AgeCheck",
  "Feature.Friends",
  "Feature.NotApproved",
  "Feature.InExperienceIntervention",
  "Feature.AppealsPortal",
  "Feature.UniversalFeatureRestrictions",
  "Feature.Chat",
] as const;

const useChatTranslate = (): TChatTranslate => {
  // One call per namespace: rules-of-hooks forbids mapping over the list.
  const t0 = useTranslations(asNamespace("Feature.RobloxSubscription"));
  const t1 = useTranslations(asNamespace("CommonUI.Messages"));
  const t2 = useTranslations(asNamespace("CommonUI.Controls"));
  const t3 = useTranslations(asNamespace("AccountIdentity.AgeCheck"));
  const t4 = useTranslations(asNamespace("Feature.Friends"));
  const t5 = useTranslations(asNamespace("Feature.NotApproved"));
  const t6 = useTranslations(asNamespace("Feature.InExperienceIntervention"));
  const t7 = useTranslations(asNamespace("Feature.AppealsPortal"));
  const t8 = useTranslations(asNamespace("Feature.UniversalFeatureRestrictions"));
  const t9 = useTranslations(asNamespace("Feature.Chat"));

  // Translators are memoized per namespace, so this stays stable like the legacy `translate`.
  return useMemo<TChatTranslate>(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- string keys at runtime
    const translators = [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9] as unknown as TLooseTranslator[];
    return (key, params, fallback) => {
      const translator = translators.find(candidate => candidate.has(key));
      const result = translator ? translator(key, params) : "";
      return result.length > 0 ? result : (fallback ?? "");
    };
  }, [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9]);
};

export default useChatTranslate;
