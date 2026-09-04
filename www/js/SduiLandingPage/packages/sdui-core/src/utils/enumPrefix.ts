/**
 * Strip a SHOUTY_SNAKE_CASE proto enum prefix and convert the remainder to
 * camelCase (or PascalCase when `capitalize` is true). Matches lua-apps
 * `ProtoVariableMapper.convertToLuaEnum`.
 *
 *   stripEnumPrefix("AUTOMATIC_SIZE_XY",     "AUTOMATIC_SIZE_") → "xy"
 *   stripEnumPrefix("TEXT_TRUNCATE_AT_END",  "TEXT_TRUNCATE_")  → "atEnd"
 *   stripEnumPrefix("ACTION_TYPE_LINK",      "ACTION_TYPE_", true) → "Link"
 *   stripEnumPrefix("ACTION_TYPE_OPEN_GAME_DETAILS", "ACTION_TYPE_", true) → "OpenGameDetails"
 */
export function stripEnumPrefix(value: unknown, prefix: string, capitalize = false): string {
  if (typeof value !== "string") return "";
  if (!value.startsWith(prefix)) return value;

  const camel = value
    .slice(prefix.length)
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

  if (!capitalize || camel.length === 0) {
    return camel;
  }
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}
