// Temporarily copied from `@rbx/foundation-ui` since the NavigationRail component is not available yet.
export const interactable =
  "relative clip group/interactable focus-visible:outline-focus disabled:outline-none";

export const StateLayer = () => (
  <div
    role="presentation"
    className="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none"
  />
);

export const navItemClasses =
  "content-emphasis text-title-large flex items-center gap-small padding-left-xsmall padding-right-xxsmall radius-medium";

export const iconContainer =
  "size-1000 grow-0 shrink-0 basis-auto flex justify-center items-center";

export const blackbirdPathRegex = /^\/plus(\/|$)/;
