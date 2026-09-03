import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import { RequestService } from "../../common/request";
import { TRANSLATION_CONFIG } from "./app.config";
import AccountRecoveryContainer from "./containers/accountRecovery";
import { AccountRecoveryContextProvider } from "./store/contextProvider";
import { EventService } from "./services/eventservice";

const queryClient = new QueryClient();

type Props = {
  requestService: RequestService;
  eventService: EventService;
} & WithTranslationsProps;

const App: React.FC<Props> = ({ requestService, eventService, translate }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AccountRecoveryContextProvider
        requestService={requestService}
        eventService={eventService}
        translate={translate}
      >
        <AccountRecoveryContainer />
      </AccountRecoveryContextProvider>
    </QueryClientProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
