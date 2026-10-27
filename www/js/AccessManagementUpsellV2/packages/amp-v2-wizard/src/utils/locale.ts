import Intl from "@rbx/core-scripts/intl";
import { getLocaleFromDocument } from "@rbx/www-common/intl";

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

/** The page locale in ISO form, e.g. `en-us`. */
export const getLocale = (): string =>
  isNextJs ? getLocaleFromDocument() : new Intl().getLocale();

/** The page locale in Roblox form, e.g. `en_us`. */
export const getRobloxLocale = (): string => getLocale().replace(/-/g, "_");
