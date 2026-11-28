import { suffixNames, type SuffixNames as SuffixNamesType } from "@rbx/core-lib/number";

// Moved to @rbx/core-lib/number, so the code runs from core-lib on Next.js too.
export { abbreviateNumber, formatNumber, suffixes, truncNumber } from "@rbx/core-lib/number";

// The old enum's name, which callers still use as both a value and a type.
export const SuffixNames = suffixNames;
export type SuffixNames = SuffixNamesType;
