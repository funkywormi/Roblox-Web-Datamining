import {
  observeIntersection as observeChildrenVisibilityImpl,
  observeVisibility as observeVisibilityImpl,
  type TObserveIntersectionOptions as ObserveChildrenVisibilityOptions,
  type TObserveVisibilityOptions as ObserveVisibilityOptions,
  type TVisibilityCallback as VisibilityCallback,
} from "@rbx/core-lib/element-visibility";

/** @deprecated Import from `@rbx/core-lib/element-visibility` instead. */
export type TVisibilityCallback = VisibilityCallback;

/** @deprecated Import from `@rbx/core-lib/element-visibility` instead. */
export type TObserveVisibilityOptions = ObserveVisibilityOptions;

/** @deprecated Import `TObserveIntersectionOptions` from `@rbx/core-lib/element-visibility` instead. */
export type TObserveChildrenVisibilityOptions = ObserveChildrenVisibilityOptions;

/** @deprecated Import from `@rbx/core-lib/element-visibility` instead. */
export const observeVisibility = observeVisibilityImpl;

/** @deprecated Import `observeIntersection` from `@rbx/core-lib/element-visibility` instead. */
export const observeChildrenVisibility = observeChildrenVisibilityImpl;
