/**
 * Version of this package, sent as `client_version` in abuse report telemetry.
 *
 * Deliberately a literal rather than a `package.json` import: `tsup` inlines it
 * into `dist`, so a packed tarball keeps reporting the version it was built at
 * even once the repo has moved on. `version.test.ts` guards it against drift.
 */
export const CLIENT_VERSION = "1.3.1";
