/**
 * Config schema version this package renders and requests from the
 * dynamic-config endpoint. The preview renderer publishes it as its supported
 * version, so previews refuse configs of any other version.
 *
 * Bump only after checking the schema changelog in
 * @rbx/abuse-report-config-types for changes Web must handle;
 * fetchConfig.test.ts fails until this matches CONFIG_VERSION.
 */
export const SUPPORTED_CONFIG_VERSION = 5;
