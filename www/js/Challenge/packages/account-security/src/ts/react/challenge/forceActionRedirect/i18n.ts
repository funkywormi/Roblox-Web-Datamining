import type { Namespace } from "@rbx/www-common/i18n";

type IntlValue = string | number | Date;

/**
 * The namespace is chosen at runtime per challenge type, but CI narrows `Namespace` to the
 * generated locale catalogue, so assert past it (as `purchase-common`'s `useTranslate` does).
 */
export const asNamespace = (name: string): Namespace =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see note above
  name as unknown as Namespace;

const isIntlValue = (value: unknown): value is IntlValue =>
  typeof value === "string" || typeof value === "number" || value instanceof Date;

/** Narrows the contract's `Record<string, unknown>` parameters to what `t.dynamic` formats. */
export const toIntlValues = (
  parameters?: Record<string, unknown>,
): Record<string, IntlValue> | undefined =>
  parameters &&
  Object.fromEntries(
    Object.entries(parameters).filter((entry): entry is [string, IntlValue] =>
      isIntlValue(entry[1]),
    ),
  );
