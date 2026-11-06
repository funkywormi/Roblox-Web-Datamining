import React from "react";
import { PromptAssignment } from "../../common/request/types/promptAssignments";
import AccountSecurityPromptContainer from "./containers/accountSecurityPrompt";
import { PromptRequestService } from "./requestService";
import { EventService } from "./services/eventService";
import { AccountSecurityPromptContextProvider } from "./store/contextProvider";

/**
 * Core parameters provided by the experimentation framework.
 */
type Props = {
  promptAssignment: PromptAssignment;
  username: string;
  isUserUnder13: boolean;
  eventService: EventService;
  requestService: PromptRequestService;
};

const App: React.FC<Props> = ({
  promptAssignment,
  username,
  isUserUnder13,
  eventService,
  requestService,
}: Props) => {
  return (
    <AccountSecurityPromptContextProvider
      promptAssignment={promptAssignment}
      username={username}
      isUserUnder13={isUserUnder13}
      eventService={eventService}
      requestService={requestService}
    >
      <AccountSecurityPromptContainer />
    </AccountSecurityPromptContextProvider>
  );
};

export default App;
