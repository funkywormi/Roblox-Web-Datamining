import type { EntityData } from "../../../types";
import { EntityStore } from "../EntityStore";

/** Content-type key under which creators are registered on the data binder. */
export const CREATOR_CONTENT_TYPE = "creator";

/** Implicit `inputData` keys for `creator` specs without an explicit `inputPath`. */
export const CREATOR_DEFAULT_PATHS: readonly string[] = ["creator_key", "creatorKey"];

/**
 * Camel-cased view of `creator_data.proto` as held in the cache. All
 * fields optional (partial hydration); `int64 creator_id` lands as
 * string. Hand-rolled rather than imported from
 * `@rbx/service-contracts-proto` — see `BadgeData` for the full
 * rationale.
 */
export interface CreatorData extends EntityData {
  /** "User" or "Group". */
  creatorType?: string;
  creatorId?: string;
  creatorName?: string;
  isVerified?: boolean;
}

/**
 *
 * Browser: lazy process singleton — shared across services bundles
 *
 * SSR: fresh instance per call, scoped to the calling
 * `createSduiServices()` request.
 *
 * No derived fields — every consumed field exists on the raw record. To add
 * one, pass `derivedFieldComputer` to `super()`.
 */
export class CreatorStore extends EntityStore<CreatorData> {}
