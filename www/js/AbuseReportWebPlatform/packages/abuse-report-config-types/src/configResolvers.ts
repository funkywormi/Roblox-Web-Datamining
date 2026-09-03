import type {
  ResourceStatement,
  SwitchStatement,
  AttributeStatement,
  StoreStatement,
  ResolverStatements,
} from "./configSchemas";
import type { JsonValue } from "./transformJsonLeafFirst";
import { transformJsonLeafFirst } from "./transformJsonLeafFirst";

/**
 * Type guard to make sure we have an object.
 */
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object";

/**
 * Get a value from a nested object by a dot-separated path.
 * Example:
 * ```
 * getByPath({ a: { b: { c: "value" } } }, "a.b.c") => "value"
 * ```
 */
export const getByPath = (object: JsonValue, path: string): JsonValue | undefined => {
  const value = path
    .split(".")
    .reduce(
      (objectOrChild, keyPart) => (isRecord(objectOrChild) ? objectOrChild[keyPart] : undefined),
      object,
    );
  return value;
};

/**
 * In config logic, zero is counted as true (unlike plain JS).
 */
export const isTruthy = (config: JsonValue): boolean => {
  if (!config && config !== 0) {
    return false;
  }
  return true;
};

export type Stores = {
  store: Record<string, JsonValue>;
  resources: Record<string, { type: string; value: JsonValue }>;
  attributes: Record<string, JsonValue>;
};

/**
 * Convenient grouping of our resolvers.
 */
export const resolveMap = {
  $resource: {
    is: (value: object): value is ResourceStatement =>
      "$resource" in value && typeof value.$resource === "string",
    resolve: (stmt: ResourceStatement, { resources }: Stores): JsonValue | undefined =>
      resources[stmt.$resource]?.value,
  },
  $attribute: {
    is: (value: object): value is AttributeStatement =>
      "$attribute" in value && typeof value.$attribute === "string",
    resolve: (stmt: AttributeStatement, { attributes }: Stores): JsonValue | undefined =>
      attributes[stmt.$attribute],
  },
  $store: {
    is: (value: object): value is StoreStatement =>
      "$store" in value && typeof value.$store === "string",
    resolve: (stmt: StoreStatement, { store }: Stores): JsonValue | undefined =>
      getByPath(store, stmt.$store),
  },
  $switch: {
    is: (value: object): value is SwitchStatement<JsonValue> =>
      "$switch" in value && Array.isArray(value.$switch),
    resolve: (
      stmt: SwitchStatement<JsonValue>,
    ): { value: JsonValue | undefined; caseIndex: number } => {
      for (let i = 0; i < stmt.$switch.length; i += 1) {
        const caseItem = stmt.$switch[i];
        if (typeof caseItem === "string") {
          return { value: caseItem, caseIndex: i };
        }
        if (caseItem && isTruthy(caseItem.condition)) {
          return { value: caseItem.value, caseIndex: i };
        }
      }
      return { value: undefined, caseIndex: -1 };
    },
  },
};

export type ResolverType = keyof typeof resolveMap;

export type OnResolveInfo = {
  node: ResolverStatements<unknown>;
  resolverType: ResolverType;
  resolved: JsonValue | undefined;
  caseIndex?: number;
};

/**
 * Process a config value and resolves (i.e. replaces) any special statements such as
 * $resource, $store, $switch, etc with the resolved values.
 *
 * e.g.
 * ```
 * {
 *   $resource: "myResource",
 *   $store: "selectedSurface.label",
 *   $switch: [{ condition: true, value: "on" }, "off"],
 * }
 * ```
 * becomes
 * ```
 * {
 *   resource: "resourceValue",
 *   store: "Voice Chat",
 *   switch: "on",
 * }
 * ```
 *
 * @param onResolve Optional callback invoked after each resolver statement is resolved.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const resolveConfig = <X extends JsonValue>(
  data: JsonValue,
  stores: Stores,
  onResolve?: (info: OnResolveInfo) => void,
): X => {
  const resolved = transformJsonLeafFirst(data, node => {
    if (typeof node === "object" && node) {
      if (resolveMap.$resource.is(node)) {
        const result = resolveMap.$resource.resolve(node, stores);
        onResolve?.({ node, resolverType: "$resource", resolved: result });
        return result;
      }
      if (resolveMap.$attribute.is(node)) {
        const result = resolveMap.$attribute.resolve(node, stores);
        onResolve?.({ node, resolverType: "$attribute", resolved: result });
        return result;
      }
      if (resolveMap.$store.is(node)) {
        const result = resolveMap.$store.resolve(node, stores);
        onResolve?.({ node, resolverType: "$store", resolved: result });
        return result;
      }
      if (resolveMap.$switch.is(node)) {
        const { value, caseIndex } = resolveMap.$switch.resolve(node);
        onResolve?.({ node, resolverType: "$switch", resolved: value, caseIndex });
        return value;
      }
    }
    return node;
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return resolved as X;
};
