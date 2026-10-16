import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { WithTranslationsProps, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";

import { supportChatTranslationConfig } from "./app.config";
import { AppRoute } from "./core/types/common";
import ChatWidget from "./components/sierra/ChatWidget";
import C3Chat from "./components/c3-chat/Chat";
import SupportLanding from "./components/SupportLanding";

const App: React.FC<WithTranslationsProps> = () => {
  return (
    <BrowserRouter>
      <Switch>
        {/* Sierra Support Chat */}
        <Route exact path={AppRoute.SupportChatSierra} component={ChatWidget} />
        {/* prefix refers to the users locale, eg: '/fr/support/chat' */}
        <Route exact path={`/:prefix${AppRoute.SupportChatSierra}`} component={ChatWidget} />

        {/* C3 Chat (originating from React Support Form) */}
        <Route exact path={AppRoute.SupportChatC3} component={C3Chat} />
        {/* prefix refers to the users locale */}
        <Route exact path={`/:prefix${AppRoute.SupportChatC3}`} component={C3Chat} />

        {/* Support Form with Age Gate, or the new support experience when metadata enables it */}
        <Route path={AppRoute.Default} component={SupportLanding} />
      </Switch>
    </BrowserRouter>
  );
};

export default withTranslations(App, supportChatTranslationConfig);
