import type { BindingContext, SduiTemplateStore } from "../../../../types";
import {
  asRecordOrEmpty,
  isRecord,
  stringFieldOr,
  type RecordOf,
} from "../../../../utils/typeGuards";
import { resolveTemplate, type ResolvedTemplate } from "../../utils/resolveTemplate";
import type { ComponentListEntry, ResolvedItemOverride } from "./types";

function tryResolveTemplate(
  robloxComponent: string | undefined,
  inlineComponent: RecordOf | undefined,
  ctx: BindingContext,
  templateStore: SduiTemplateStore,
  identifierForLog?: string,
): ResolvedTemplate | undefined {
  const inline = inlineComponent;
  const rct = robloxComponent;
  if (!inline && !rct) return undefined;
  return resolveTemplate(inline, rct ?? "", ctx, templateStore, identifierForLog);
}

function resolveItemOverrides(
  itemOverrides: Record<string, RecordOf> | undefined,
  ctx: BindingContext,
  templateStore: SduiTemplateStore,
): Record<string, ResolvedItemOverride> | undefined {
  if (!itemOverrides || Object.keys(itemOverrides).length === 0) return undefined;

  const resolved: Record<string, ResolvedItemOverride> = {};
  for (const [identifier, override] of Object.entries(itemOverrides)) {
    const inline = isRecord(override.inlineComponent) ? override.inlineComponent : undefined;
    const rct = stringFieldOr(override, "robloxComponent", "");
    const pair = tryResolveTemplate(rct || undefined, inline, ctx, templateStore, identifier);
    resolved[identifier] = {
      template: pair?.template,
      isInline: pair?.isInline ?? false,
      inputs: isRecord(override.inputs) ? override.inputs : undefined,
      sortRankProp: override.sortRank,
    };
  }
  return resolved;
}

function resolveDefaultTemplate(
  defaultItem: RecordOf | undefined,
  ctx: BindingContext,
  templateStore: SduiTemplateStore,
): ResolvedTemplate | undefined {
  if (!defaultItem) return undefined;
  const inline = isRecord(defaultItem.inlineComponent) ? defaultItem.inlineComponent : undefined;
  const rct = stringFieldOr(defaultItem, "robloxComponent", "");
  return tryResolveTemplate(rct || undefined, inline, ctx, templateStore);
}

function pickTemplate(
  item: unknown,
  override: ResolvedItemOverride | undefined,
  defaultResolved: ResolvedTemplate | undefined,
  ctx: BindingContext,
  templateStore: SduiTemplateStore,
): ResolvedTemplate | undefined {
  const itemRecord = isRecord(item) ? item : undefined;
  const itemRoblox = itemRecord ? stringFieldOr(itemRecord, "robloxComponent", "") : "";
  const itemInline = itemRecord?.inlineComponent;
  const itemInlineRecord = isRecord(itemInline) ? itemInline : undefined;

  const itemResolvedTemplate = tryResolveTemplate(
    itemRoblox || undefined,
    itemInlineRecord,
    ctx,
    templateStore,
  );
  if (itemResolvedTemplate) return itemResolvedTemplate;
  if (override?.template) {
    return { template: override.template, isInline: override.isInline };
  }
  return defaultResolved;
}

function normalizeIdentifier(raw: unknown): string | undefined {
  if (typeof raw !== "string" || raw === "") return undefined;
  return raw;
}

export function normalizeLiteralItems(
  items: unknown[],
  defaultItem: RecordOf | undefined,
  templateStore: SduiTemplateStore,
  ctx: BindingContext,
): ComponentListEntry[] {
  const defaultInputs =
    defaultItem && isRecord(defaultItem.inputs) ? defaultItem.inputs : undefined;
  const defaultSortRankProp = defaultItem?.sortRank;
  const defaultResolved = resolveDefaultTemplate(defaultItem, ctx, templateStore);
  const entries: ComponentListEntry[] = [];

  for (const rawItem of items) {
    const item = isRecord(rawItem) ? rawItem : asRecordOrEmpty(rawItem);
    const identifier = normalizeIdentifier(item.identifier);
    const resolved = pickTemplate(item, undefined, defaultResolved, ctx, templateStore);
    entries.push({
      item,
      identifier,
      sourceMode: "literal",
      inputs: isRecord(item.inputs) ? item.inputs : defaultInputs,
      template: resolved?.template,
      isInline: resolved?.isInline ?? false,
      sortRankProp: item.sortRank ?? defaultSortRankProp,
    });
  }
  return entries;
}

function buildBoundEntry(
  item: unknown,
  identifier: string | undefined,
  defaultResolved: ResolvedTemplate | undefined,
  defaultInputs: RecordOf | undefined,
  defaultSortRankProp: unknown,
  resolvedItemOverrides: Record<string, ResolvedItemOverride> | undefined,
  ctx: BindingContext,
  templateStore: SduiTemplateStore,
): ComponentListEntry {
  const override =
    resolvedItemOverrides && identifier ? resolvedItemOverrides[identifier] : undefined;
  const resolvedTemplate = pickTemplate(item, override, defaultResolved, ctx, templateStore);
  const itemRecord = isRecord(item) ? item : undefined;
  const rowSortRankProp = itemRecord?.sortRank;
  return {
    item,
    identifier,
    sourceMode: "data",
    inputs: override?.inputs ?? defaultInputs,
    template: resolvedTemplate?.template,
    isInline: resolvedTemplate?.isInline ?? false,
    sortRankProp: rowSortRankProp ?? override?.sortRankProp ?? defaultSortRankProp,
  };
}

export function normalizeBoundData(
  dataFromBinding: unknown,
  defaultItem: RecordOf | undefined,
  itemOverrides: Record<string, RecordOf> | undefined,
  templateStore: SduiTemplateStore,
  ctx: BindingContext,
): ComponentListEntry[] {
  const defaultInputs =
    defaultItem && isRecord(defaultItem.inputs) ? defaultItem.inputs : undefined;
  const defaultSortRankProp = defaultItem?.sortRank;
  const defaultResolvedTemplate = resolveDefaultTemplate(defaultItem, ctx, templateStore);
  const resolvedItemOverrides = resolveItemOverrides(itemOverrides, ctx, templateStore);
  const entries: ComponentListEntry[] = [];

  if (Array.isArray(dataFromBinding)) {
    for (const item of dataFromBinding) {
      const itemRecord = isRecord(item) ? item : undefined;
      const identifier = normalizeIdentifier(itemRecord?.identifier);
      entries.push(
        buildBoundEntry(
          item,
          identifier,
          defaultResolvedTemplate,
          defaultInputs,
          defaultSortRankProp,
          resolvedItemOverrides,
          ctx,
          templateStore,
        ),
      );
    }
    return entries;
  }

  if (!isRecord(dataFromBinding)) return [];
  if (Object.keys(dataFromBinding).length === 0) return [];

  for (const [key, value] of Object.entries(dataFromBinding)) {
    entries.push(
      buildBoundEntry(
        value,
        key,
        defaultResolvedTemplate,
        defaultInputs,
        defaultSortRankProp,
        resolvedItemOverrides,
        ctx,
        templateStore,
      ),
    );
  }
  return entries;
}
