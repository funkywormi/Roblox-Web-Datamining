import React from "react";
import { withTranslations, WithTranslationsProps, queryClient } from "react-utilities";
import { QueryClientProvider } from "@tanstack/react-query";
import { RequestService } from "../../common/request";
import { TRANSLATION_CONFIG } from "./app.config";
import SecurityTabContainer from "./containers/securityTab";
import { EventService } from "./services/eventService";
import { SecurityTabContextProvider } from "./store/contextProvider";
import { getChallengeParamData } from "./utils/challengeParamData";

type Props = {
  eventService: EventService;
  requestService: RequestService;
  isUnder13: boolean;
} & WithTranslationsProps;

const App: React.FC<Props> = ({ eventService, requestService, translate, isUnder13 }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityTabContextProvider
        eventService={eventService}
        requestService={requestService}
        translate={translate}
        isUnder13={isUnder13}
        challengeParamData={getChallengeParamData()}
      >
        <SecurityTabContainer />
      </SecurityTabContextProvider>
    </QueryClientProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
