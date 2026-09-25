// engine-telemetry uses prometheus to expose data to grafana, and
// prometheus only supports this subset of identifiers
const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_REGEX.test(value);
}
