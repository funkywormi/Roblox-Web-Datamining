export const FOCUSABLE_SELECTORS =
  'a[href], a[ng-click], button, input:not([type="hidden"]), textarea, select, details, summary, [tabindex]:not([tabindex="-1"]), .foundation-web-interactable, [role="option"]';

export function isElementVisible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const style = getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") {
    return false;
  }
  const detailsParent = el.closest("details");
  if (
    detailsParent &&
    !detailsParent.open &&
    !el.isSameNode(detailsParent.querySelector("summary"))
  ) {
    return false;
  }
  return el.parentElement ? isElementVisible(el.parentElement) : true;
}

export function isElementFocusable(el: HTMLElement | null): boolean {
  if (!el || typeof el.matches !== "function") return false;
  // The 'disabled' property exists on form elements like HTMLInputElement, HTMLButtonElement, etc.
  const isDisabled =
    ("disabled" in el && typeof el.disabled === "boolean" ? el.disabled : false) ||
    el.getAttribute("aria-disabled") === "true";

  // Check for inert attribute (modern focus trap mechanism)
  if (el.hasAttribute("inert") || el.closest("[inert]")) {
    return false;
  }

  return (
    el.matches(FOCUSABLE_SELECTORS) &&
    !isDisabled &&
    !el.closest('[aria-hidden="true"]') &&
    isElementVisible(el)
  );
}
