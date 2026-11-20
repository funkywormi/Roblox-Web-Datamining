/**
 * True on the Next.js page (`NEXT_PUBLIC_IS_NEXTJS` is set in apps/www) and false on the .NET page.
 * The early-click hold exists only on Next.js. The .NET page must keep its original behavior, so
 * everything the hold changes is behind this check.
 *
 * A function, not a constant, so a test can switch it. Next inlines the literal at build time.
 */
export const isNextJs = (): boolean => process.env.NEXT_PUBLIC_IS_NEXTJS === "true";
