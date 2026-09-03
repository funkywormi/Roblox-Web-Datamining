import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { withTranslations, WithTranslationsProps, queryClient } from "react-utilities";
import { RequestService } from "../../common/request";
import { TRANSLATION_CONFIG } from "./app.config";
import SessionManagementContainer from "./containers/sessionManagement";
import { EventService } from "./services/eventService";
import { SessionManagementContextProvider } from "./store/contextProvider";

type Props = {
  eventService: EventService;
  requestService: RequestService;
  numSessionsToDisplay: number;
  userHasConsoleSession: boolean;
} & WithTranslationsProps;

const App: React.FC<Props> = ({
  eventService,
  requestService,
  numSessionsToDisplay,
  userHasConsoleSession,
  translate,
}: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionManagementContextProvider
        eventService={eventService}
        requestService={requestService}
        numSessionsToDisplay={numSessionsToDisplay}
        userHasConsoleSession={userHasConsoleSession}
        translate={translate}
      >
        <SessionManagementContainer />
      </SessionManagementContextProvider>
    </QueryClientProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
