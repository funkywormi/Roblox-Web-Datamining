import type { RequestService } from "../../common/request";
import * as password from "../../common/request/apis/passwords";
import * as promptAssignments from "../../common/request/apis/promptAssignments";
import {
  trackPromptAssignmentsFetchFailed,
  trackPromptUpdated,
  trackPromptUpdateFailed,
} from "../observability";

/**
 * The requests the prompt makes. Kept narrow so the bundle skips the other APIs, whose 2SV
 * dependencies pull jQuery into every Next.js page.
 */
export type PromptRequestService = Pick<RequestService, "password" | "promptAssignments">;

const getAllForCurrentUser: typeof promptAssignments.getAllForCurrentUser = async () => {
  const result = await promptAssignments.getAllForCurrentUser();
  if (result.isError) {
    trackPromptAssignmentsFetchFailed();
  }
  return result;
};

const updateForCurrentUser: typeof promptAssignments.updateForCurrentUser = async (
  action,
  promptType,
) => {
  const result = await promptAssignments.updateForCurrentUser(action, promptType);
  if (result.isError) {
    trackPromptUpdateFailed(promptType, action);
  } else {
    trackPromptUpdated(promptType, action);
  }
  return result;
};

export const promptRequestService: PromptRequestService = {
  password,
  promptAssignments: { ...promptAssignments, getAllForCurrentUser, updateForCurrentUser },
};
