import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type {
  ActionType,
  SduiActionHandlerConfig,
  SduiActionTelemetryHandler,
  SduiComponentDefinition,
  SduiErrorReporter,
  SduiImpressionHandlerConfig,
  SduiPageContext,
  UiComponentType,
} from "../types";
import {
  createSduiActionHandlerRegistry,
  type SduiActionHandlerRegistry,
} from "./SduiActionHandlerRegistry";
import { createSduiComponentRegistry, type SduiComponentRegistry } from "./SduiComponentRegistry";
import {
  createSduiImpressionHandlerRegistry,
  type SduiImpressionHandlerRegistry,
} from "./SduiImpressionHandlerRegistry";
import {
  createSduiTelemetryHandlerNameRegistry,
  type SduiTelemetryHandlerNameRegistry,
} from "./SduiTelemetryHandlerNameRegistry";

export interface SduiRegistryModule {
  name: string;
  components?: Partial<Record<UiComponentType, SduiComponentDefinition>>;
  actionHandlers?: Partial<Record<ActionType, SduiActionHandlerConfig>>;
  impressionHandlers?: Record<string, SduiImpressionHandlerConfig | undefined>;
  telemetryHandlers?: Record<string, SduiActionTelemetryHandler>;
}

export interface SduiRegistryOverride<TKey> {
  readonly key: TKey;
  readonly owner: string;
  readonly reason: string;
}

export type SduiComponentOverride = SduiRegistryOverride<UiComponentType>;
export type SduiActionOverride = SduiRegistryOverride<ActionType>;
export type SduiImpressionOverride = SduiRegistryOverride<string>;
export type SduiTelemetryOverride = SduiRegistryOverride<string>;

export interface SduiRegistryOverridePolicy {
  readonly components?: readonly SduiComponentOverride[];
  readonly actionHandlers?: readonly SduiActionOverride[];
  readonly impressionHandlers?: readonly SduiImpressionOverride[];
  readonly telemetryHandlers?: readonly SduiTelemetryOverride[];
}

type SduiRegistryCompositionDiagnosticSeverity = "warning" | "error";

type SduiRegistryCompositionDiagnosticCode =
  | "FallbackDefinitionIgnored"
  | "UnnecessaryOverride"
  | "MissingOverrideDefinition"
  | "DuplicateOverridePolicy"
  | "InvalidOverrideReason";

interface SduiRegistryCompositionDiagnostic {
  readonly severity: SduiRegistryCompositionDiagnosticSeverity;
  readonly code: SduiRegistryCompositionDiagnosticCode;
  readonly registry: "components" | "actionHandlers" | "impressionHandlers" | "telemetryHandlers";
  readonly key: string;
  readonly owner?: string;
  readonly reason?: string;
  readonly message: string;
}

export interface SduiRegistries {
  componentRegistry: SduiComponentRegistry;
  actionHandlerRegistry: SduiActionHandlerRegistry;
  impressionHandlerRegistry: SduiImpressionHandlerRegistry;
  telemetryHandlerNameRegistry: SduiTelemetryHandlerNameRegistry;
}

export interface ComposeSduiRegistriesOptions {
  errorReporter: SduiErrorReporter;
  overridePolicy?: SduiRegistryOverridePolicy;
  pageContext?: SduiPageContext;
}

type RegistryKind = SduiRegistryCompositionDiagnostic["registry"];

interface OverridePolicyTracker {
  rulesByKey: Map<string, SduiRegistryOverride<string | number>>;
}

interface RegisterModuleEntriesOptions<T> {
  moduleName: string;
  definitions?: Record<string, T | undefined>;
  definitionsByKey: Map<string, OwnedRegistryDefinition<T>[]>;
}

interface OwnedRegistryDefinition<T> {
  owner: string;
  definition: T;
}

/**
 * Everything needed to fill one of the four registries: which field on a
 * module carries its definitions, which override rules govern it, and how to
 * write to and seal the underlying registry.
 */
interface RegistrySpec<T> {
  kind: RegistryKind;
  definitionsOf: (registryModule: SduiRegistryModule) => Record<string, T | undefined> | undefined;
  overrideRules: readonly SduiRegistryOverride<string | number>[] | undefined;
  register: (key: string, definition: T) => void;
  lock: () => void;
}

function reportCompositionDiagnostic(
  diagnostic: SduiRegistryCompositionDiagnostic,
  errorReporter: SduiErrorReporter,
  pageContext?: SduiPageContext,
): void {
  reportError(
    diagnostic.severity === "error"
      ? SduiErrorName.RegistryCompositionError
      : SduiErrorName.RegistryCompositionWarning,
    diagnostic.message,
    pageContext,
    {
      name: diagnostic.code,
      parserName: diagnostic.registry,
      propName: diagnostic.key,
      ...(diagnostic.registry === "components" ? { componentType: diagnostic.key } : {}),
      ...(diagnostic.registry === "actionHandlers" ? { actionType: diagnostic.key } : {}),
    },
    errorReporter,
  );
}

function createOverridePolicyTracker(
  kind: RegistryKind,
  rules: readonly SduiRegistryOverride<string | number>[] | undefined,
  reportDiagnostics: (diagnostic: SduiRegistryCompositionDiagnostic) => void,
): OverridePolicyTracker {
  const rulesByKey = new Map<string, SduiRegistryOverride<string | number>>();

  for (const rule of rules ?? []) {
    const key = String(rule.key);
    const existingRule = rulesByKey.get(key);

    if (existingRule) {
      reportDiagnostics({
        severity: "error",
        code: "DuplicateOverridePolicy",
        registry: kind,
        key,
        owner: rule.owner,
        reason: rule.reason,
        message: `Override policy declares more than one final owner for ${kind} "${key}"; "${existingRule.owner}" remains selected`,
      });
      continue;
    }

    if (rule.reason.trim().length === 0) {
      reportDiagnostics({
        severity: "error",
        code: "InvalidOverrideReason",
        registry: kind,
        key,
        owner: rule.owner,
        reason: rule.reason,
        message: `Override policy selecting "${rule.owner}" for ${kind} "${key}" must include a non-empty reason`,
      });
    }

    rulesByKey.set(key, rule);
  }

  return { rulesByKey };
}

function registerModuleEntries<T>({
  moduleName,
  definitions,
  definitionsByKey,
}: RegisterModuleEntriesOptions<T>): void {
  for (const [key, definition] of Object.entries(definitions ?? {})) {
    if (definition === undefined) continue;

    const ownedDefinition = { owner: moduleName, definition };
    const existingDefinitions = definitionsByKey.get(key);
    if (existingDefinitions) {
      existingDefinitions.push(ownedDefinition);
    } else {
      definitionsByKey.set(key, [ownedDefinition]);
    }
  }
}

function assertUniqueModuleNames(modules: readonly SduiRegistryModule[]): void {
  const moduleNames = new Set<string>();
  for (const registryModule of modules) {
    if (registryModule.name.trim().length === 0) {
      throw new Error("SDUI registry modules must have a non-empty name");
    }
    if (moduleNames.has(registryModule.name)) {
      throw new Error(`SDUI registry module name "${registryModule.name}" is registered twice`);
    }
    moduleNames.add(registryModule.name);
  }
}

/**
 * Collects every module's contribution to one registry, resolves collisions
 * using the consumer's selected final owners, then locks it.
 */
function fillRegistryFromModules<T>(
  modules: readonly SduiRegistryModule[],
  reportDiagnostics: (diagnostic: SduiRegistryCompositionDiagnostic) => void,
  spec: RegistrySpec<T>,
): void {
  const definitionsByKey = new Map<string, OwnedRegistryDefinition<T>[]>();
  const overrideTracker = createOverridePolicyTracker(
    spec.kind,
    spec.overrideRules,
    reportDiagnostics,
  );

  for (const registryModule of modules) {
    registerModuleEntries({
      moduleName: registryModule.name,
      definitions: spec.definitionsOf(registryModule),
      definitionsByKey,
    });
  }

  const handledPolicyKeys = new Set<string>();
  for (const [key, definitions] of definitionsByKey) {
    const [firstDefinition, ...duplicateDefinitions] = definitions;
    if (!firstDefinition) continue;

    const overrideRule = overrideTracker.rulesByKey.get(key);

    if (!overrideRule) {
      spec.register(key, firstDefinition.definition);
      for (const duplicateDefinition of duplicateDefinitions) {
        const message = `SDUI registry module "${duplicateDefinition.owner}" provided fallback ${spec.kind} "${key}", but the more specific module "${firstDefinition.owner}" already defined it; the fallback definition was ignored`;
        // Commented out so this does not report to the SDUI error reporter; log to the console instead.
        // reportDiagnostics({
        //   severity: "warning",
        //   code: "FallbackDefinitionIgnored",
        //   registry: spec.kind,
        //   key,
        //   owner: duplicateDefinition.owner,
        //   message,
        // });
        console.warn(`[sdui-core] ${SduiErrorName.RegistryCompositionWarning}: ${message}`);
      }
      continue;
    }

    handledPolicyKeys.add(key);
    const selectedDefinition = definitions.find(
      definition => definition.owner === overrideRule.owner,
    );

    if (!selectedDefinition) {
      reportDiagnostics({
        severity: "error",
        code: "MissingOverrideDefinition",
        registry: spec.kind,
        key,
        owner: overrideRule.owner,
        reason: overrideRule.reason,
        message: `Override policy selected "${overrideRule.owner}" for ${spec.kind} "${key}", but that owner supplied no definition; the first definition remains active`,
      });
      spec.register(key, firstDefinition.definition);
      continue;
    }

    if (definitions.length === 1) {
      reportDiagnostics({
        severity: "warning",
        code: "UnnecessaryOverride",
        registry: spec.kind,
        key,
        owner: overrideRule.owner,
        reason: overrideRule.reason,
        message: `Override policy selected "${overrideRule.owner}" for ${spec.kind} "${key}", but no competing definition exists`,
      });
    }

    spec.register(key, selectedDefinition.definition);
  }

  for (const [key, rule] of overrideTracker.rulesByKey) {
    if (handledPolicyKeys.has(key)) continue;

    reportDiagnostics({
      severity: "error",
      code: "MissingOverrideDefinition",
      registry: spec.kind,
      key,
      owner: rule.owner,
      reason: rule.reason,
      message: `Override policy selected "${rule.owner}" for ${spec.kind} "${key}", but no definition exists for that key`,
    });
  }

  spec.lock();
}

/**
 * Applies named registry modules from most specific to most generic and locks
 * the resulting registries. The first definition wins by default; later
 * fallback definitions fill only missing keys. The page composition root can
 * select a different owner for exceptional collisions.
 */
export function composeSduiRegistries(
  modules: readonly SduiRegistryModule[],
  options: ComposeSduiRegistriesOptions,
): SduiRegistries {
  const { errorReporter, overridePolicy = {}, pageContext } = options;
  const componentRegistry = createSduiComponentRegistry();
  const actionHandlerRegistry = createSduiActionHandlerRegistry();
  const impressionHandlerRegistry = createSduiImpressionHandlerRegistry();
  const telemetryHandlerNameRegistry = createSduiTelemetryHandlerNameRegistry();

  const reportDiagnostics = (diagnostic: SduiRegistryCompositionDiagnostic): void => {
    reportCompositionDiagnostic(diagnostic, errorReporter, pageContext);
  };

  assertUniqueModuleNames(modules);

  fillRegistryFromModules(modules, reportDiagnostics, {
    kind: "components",
    definitionsOf: registryModule => registryModule.components,
    overrideRules: overridePolicy.components,
    register: (key, definition) => {
      componentRegistry.registerComponentDefinition(Number(key) as UiComponentType, definition);
    },
    lock: () => {
      componentRegistry.lock();
    },
  });
  fillRegistryFromModules(modules, reportDiagnostics, {
    kind: "actionHandlers",
    definitionsOf: registryModule => registryModule.actionHandlers,
    overrideRules: overridePolicy.actionHandlers,
    register: (key, definition) => {
      actionHandlerRegistry.registerActionHandler(Number(key) as ActionType, definition);
    },
    lock: () => {
      actionHandlerRegistry.lock();
    },
  });
  fillRegistryFromModules(modules, reportDiagnostics, {
    kind: "impressionHandlers",
    definitionsOf: registryModule => registryModule.impressionHandlers,
    overrideRules: overridePolicy.impressionHandlers,
    register: (key, definition) => {
      impressionHandlerRegistry.registerImpressionHandler(key, definition);
    },
    lock: () => {
      impressionHandlerRegistry.lock();
    },
  });
  fillRegistryFromModules(modules, reportDiagnostics, {
    kind: "telemetryHandlers",
    definitionsOf: registryModule => registryModule.telemetryHandlers,
    overrideRules: overridePolicy.telemetryHandlers,
    register: (key, definition) => {
      telemetryHandlerNameRegistry.registerTelemetryHandler(key, definition);
    },
    lock: () => {
      telemetryHandlerNameRegistry.lock();
    },
  });

  return {
    componentRegistry,
    actionHandlerRegistry,
    impressionHandlerRegistry,
    telemetryHandlerNameRegistry,
  };
}
