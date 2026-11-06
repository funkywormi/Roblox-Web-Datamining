import React, { useEffect, useMemo, useState } from "react";
import "../../../css/accountSecurityPrompt/accountSecurityPrompt.css";
import "../../../css/accountSecurityPrompt/banner.css";
import {
  PromptAssignment,
  PromptAssignmentsError,
} from "../../common/request/types/promptAssignments";
import App from "./App";
import { LOG_PREFIX } from "./app.config";
import { selectPromptAssignment } from "./selectPromptAssignment";
import { PromptRequestService } from "./requestService";
import { EventServiceDefault } from "./services/eventService";
import { trackPromptShown } from "../observability";

type Props = {
  href: string;
  username: string;
  isUserUnder13: boolean;
  requestService: PromptRequestService;
};

/**
 * Fetches the current user's prompt assignments and renders the first one allowed at `href`, once
 * per mount like a .NET page load. Next.js remounts it on each route change, since every route
 * renders its own NavLayout.
 */
const AccountSecurityPromptRoot: React.FC<Props> = ({
  href,
  username,
  isUserUnder13,
  requestService,
}: Props) => {
  const [promptAssignment, setPromptAssignment] = useState<PromptAssignment | null>(null);

  useEffect(() => {
    let isCancelled = false;
    // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation -- .NET mounts this without a QueryClientProvider
    void requestService.promptAssignments.getAllForCurrentUser().then(result => {
      if (isCancelled) {
        return;
      }
      if (result.isError) {
        // eslint-disable-next-line no-console
        console.warn(
          LOG_PREFIX,
          "Retrieving prompt assignments failed with error",
          result.error && PromptAssignmentsError[result.error],
        );
        return;
      }
      if (result.value.length === 0) {
        // eslint-disable-next-line no-console
        console.log(LOG_PREFIX, "No assignments were retrieved");
        return;
      }
      const selected = selectPromptAssignment(result.value, href);
      if (selected != null) {
        trackPromptShown(selected.promptType);
      }
      setPromptAssignment(selected);
    });
    return () => {
      isCancelled = true;
    };
  }, [requestService, href]);

  const eventService = useMemo(
    () => promptAssignment && new EventServiceDefault(promptAssignment.promptType),
    [promptAssignment],
  );

  if (promptAssignment == null || eventService == null) {
    return null;
  }

  return (
    <App
      promptAssignment={promptAssignment}
      username={username}
      isUserUnder13={isUserUnder13}
      eventService={eventService}
      requestService={requestService}
    />
  );
};

export default AccountSecurityPromptRoot;
