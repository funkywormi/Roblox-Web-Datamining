interface FocusCandidate {
  element: HTMLElement;
  priority: number;
}

/**
 * Checks if an element is visible using the checkVisibility API.
 * Falls back to assuming visible if the API is not supported.
 */
const isElementVisible = (element: HTMLElement): boolean => {
  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility();
  }

  return true;
};

/**
 * Checks if an element is disabled.
 * Checks both the disabled property (for form elements) and aria-disabled attribute.
 */
const isElementDisabled = (element: HTMLElement): boolean => {
  if ('disabled' in element && (element as HTMLInputElement | HTMLButtonElement).disabled) {
    return true;
  }

  const ariaDisabled = element.getAttribute('aria-disabled');
  if (ariaDisabled === 'true') {
    return true;
  }

  return false;
};

/**
 * Checks if an element is a valid focus candidate.
 * An element is valid if it is visible and not disabled.
 */
const isValidFocusCandidate = (element: HTMLElement): boolean => {
  return isElementVisible(element) && !isElementDisabled(element);
};

/**
 * Selects text in an input element if it's not already focused.
 */
const selectTextIfInput = (element: HTMLElement): void => {
  if (element instanceof HTMLInputElement && typeof element.select === 'function') {
    element.select();
  }
};

/**
 * Auto-focus handler for Radix Dialog components, for cases where we DO NOT want to
 * select the first focusable element (for example in a Sheet with navigation button before the title and
 * it would not be desirable to auto focus on that button).
 *
 * This utility is specifically designed to work with Radix Dialog's onOpenAutoFocus event.
 * The event target is expected to be the dialog element itself.
 *
 * The handler looks for elements with `data-autofocus-priority` attribute and focuses
 * the element with the lowest priority number that passes visibility and disabled checks.
 *
 * Usage: Add `data-autofocus-priority="1"` (or any number) to elements you want to be
 * considered for auto-focus. Lower numbers have higher priority.
 *
 * Example:
 * ```tsx
 * <RadixDialog.Content onOpenAutoFocus={dialogAutoFocusByPriority}>
 *   <TextInput data-autofocus-priority="1" label="Name" /> // Will be focused first
 *   <Button data-autofocus-priority="10">Submit</Button>   // Will be focused if priority 1 element is hidden/disabled
 * </RadixDialog.Content>
 * ```
 *
 * If no valid elements with the attribute are found, it returns without preventing default,
 * allowing Radix to handle focus management normally.
 */

const autoFocusByPriority = (event: Event) => {
  // NOTE: We expect this to be used with the radix Dialog component, so
  // `target` should always be the dialog element.
  const target = event.currentTarget as HTMLElement;
  if (!target) return;

  const elements = target.querySelectorAll('[data-autofocus-priority]');

  if (elements.length === 0) return;

  const candidates: FocusCandidate[] = [];

  elements.forEach(element => {
    const priorityAttr = element.getAttribute('data-autofocus-priority');
    const priority = parseInt(priorityAttr || '', 10);

    if (!Number.isNaN(priority) && element instanceof HTMLElement) {
      candidates.push({ element, priority });
    }
  });

  candidates.sort((a, b) => a.priority - b.priority);

  const validCandidate = candidates.find(candidate => isValidFocusCandidate(candidate.element));

  if (validCandidate) {
    event.preventDefault();
    const wasAlreadyFocused = document.activeElement === validCandidate.element;
    validCandidate.element.focus();
    if (!wasAlreadyFocused) {
      selectTextIfInput(validCandidate.element);
    }
  }
};

export default autoFocusByPriority;
