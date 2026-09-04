import type { SduiActionSnapshot } from "../types";
import { DataStatus } from "../types";
import { asRecord, hasSduiKind, isRecord, readSduiKind } from "../utils/typeGuards";

type SduiPropValueKind = "propRecord" | "propList" | "action";

interface SduiPropValue<K extends SduiPropValueKind> {
  readonly __sduiKind: K;
}

export type SduiRecordValue = Readonly<Record<string, unknown>> & SduiPropValue<"propRecord">;

export type SduiListValue = readonly unknown[] & SduiPropValue<"propList">;

export type SduiActionValue = SduiActionSnapshot & SduiPropValue<"action">;

export function createSduiRecordValue(fields: Readonly<Record<string, unknown>>): SduiRecordValue {
  return { ...fields, __sduiKind: "propRecord" };
}

export function createSduiListValue(items: readonly unknown[]): SduiListValue {
  return Object.assign([...items], { __sduiKind: "propList" as const });
}

export function createSduiActionValue(snapshot: SduiActionSnapshot): SduiActionValue {
  return { ...snapshot, __sduiKind: "action" };
}

export function isSduiRecordValue(value: unknown): value is SduiRecordValue {
  return isRecord(value) && readSduiKind(value) === "propRecord";
}

export function isSduiListValue(value: unknown): value is SduiListValue {
  return Array.isArray(value) && readSduiKind(value) === "propList";
}

export function isSduiActionValue(value: unknown): value is SduiActionValue {
  if (!hasSduiKind(value, "action")) return false;
  const snapshot = asRecord(value);
  if (snapshot === undefined) return false;

  if (snapshot.status === DataStatus.Ready) {
    const actionData = asRecord(snapshot.actionData);
    return (
      actionData !== undefined &&
      typeof actionData.actionType === "number" &&
      isRecord(actionData.actionParams)
    );
  }

  return (
    (snapshot.status === DataStatus.NotReady || snapshot.status === DataStatus.Failed) &&
    !Object.hasOwn(snapshot, "actionData")
  );
}
