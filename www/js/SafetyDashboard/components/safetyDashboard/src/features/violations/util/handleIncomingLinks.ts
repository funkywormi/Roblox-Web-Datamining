/** vid is short for Violation ID */
const VIOLATION_ID_PARAM_NAME = "vid";

/**
 * In the lua app, there
 * 1. wasn't good support for modifying the #hash part of the url
 * 2. the #hash part is a bit fragile to use (imagine we change the router a bit)
 *
 * Instead if we want to look at a specific violations, the `vid=<id>` param is set.
 *
 * So when we load the page we check if that is set update the URL to be correct.
 *
 * e.g. we'll go from
 * /safety-dashboard?vid=123-452-avc
 * to
 * /safety-dashboard#/violations/123-452-avc
 */

export const handleViolationIDParam = (): void => {
  try {
    const url = new URL(window.location.href);
    const violationId = url.searchParams.get(VIOLATION_ID_PARAM_NAME);

    if (violationId) {
      url.searchParams.delete(VIOLATION_ID_PARAM_NAME);
      url.hash = `#/violations/${encodeURIComponent(violationId)}`;
      // Replace the current URL in the browser history without reloading the page
      window.history.replaceState({}, "", url.toString());
    }
  } catch (err) {
    console.error(err);
  }
};
