import {
  PageRestriction,
  PromptAssignment,
  PromptType,
} from "../../common/request/types/promptAssignments";
import {
  ACCOUNT_SETTINGS_URL_FRAGMENT,
  AUTH_REDIRECT_URL_SIGNIFIER,
  HOME_PAGE_URL_FRAGMENT,
} from "./app.config";

/**
 * Whether a page gets no prompt at all: account settings, or a page a prompt redirected the user to.
 */
export const isPromptExcludedOnPage = (href: string): boolean =>
  href.includes(AUTH_REDIRECT_URL_SIGNIFIER) || href.includes(ACCOUNT_SETTINGS_URL_FRAGMENT);

const isRestrictedToHomePage = (assignment: PromptAssignment, href: string): boolean =>
  (assignment.promptType === PromptType.BROADER_AUTHENTICATOR_UPSELL ||
    assignment.promptType === PromptType.EMAIL_2SV_UPSELL) &&
  assignment.isGeneric === false &&
  assignment.metadata.pageRestriction === PageRestriction.HOME_PAGE_ONLY &&
  !href.includes(HOME_PAGE_URL_FRAGMENT);

/**
 * The first assignment allowed on the page at `href`, or null. The backend returns assignments in
 * priority order.
 */
export const selectPromptAssignment = (
  assignments: PromptAssignment[],
  href: string,
): PromptAssignment | null => {
  if (isPromptExcludedOnPage(href)) {
    return null;
  }
  return assignments.find(assignment => !isRestrictedToHomePage(assignment, href)) ?? null;
};
