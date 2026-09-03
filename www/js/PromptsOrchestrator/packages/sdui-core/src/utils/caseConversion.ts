/**
 * snake_case ↔ camelCase string utilities.
 *
 * Used for matching template binding paths (snake_case, as authored against
 * proto field names) against decoded protobuf-es messages (which expose every
 * field as camelCase).
 */

export function snakeToCamel(s: string): string {
  return s.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

export function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, char => `_${char.toLowerCase()}`);
}

/**
 * Converts a PascalCase or camelCase identifier to kebab-case.
 *
 * Used to map Foundation `IconName` tokens onto their Tailwind icon-class
 * segment (`"MagnifyingGlass"` → `"magnifying-glass"`,
 * `"ThreeDotsHorizontal"` → `"three-dots-horizontal"`). The acronym rule
 * splits runs of capitals before a trailing capitalized word
 * (`"HTMLTag"` → `"html-tag"`). Already-kebab or lowercase input is returned
 * unchanged.
 */
export function pascalOrCamelToKebab(s: string): string {
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}
