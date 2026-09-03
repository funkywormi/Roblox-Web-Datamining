import React from "react";
import { HashRouter, Link, Route, Switch, useLocation } from "react-router-dom";
import { useTranslation } from "@rbx/core-scripts/react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { Badge, FeedbackBanner, Icon } from "@rbx/foundation-ui";
import { useSystemFeedback } from "@rbx/core-ui";
import { SupportCenterProvider, useSupportCenterContext } from "../context/SupportCenterContext";
import routes, { TicketRouteParams } from "../constants/routes";
import { getSourceUrl, ReturnLinkSourceType } from "../utils/sourceHelper";
import TicketList from "./TicketList";
import TicketDetails from "./TicketDetails";

const BREADCRUMB_SEPARATOR = " / ";

const SOURCE_LINK_LABEL_TRANSLATION_KEYS: Record<string, string> = {
  [ReturnLinkSourceType.ForumPost]: "Action.BackToForumPost",
};

const SupportCenterTicket: React.FC<TicketRouteParams> = ({ universeId, ticketId }) => {
  const { translate } = useTranslation();
  const { search } = useLocation();

  return (
    <div>
      <Link
        className="flex items-center text-link margin-bottom-small"
        to={{ pathname: routes.defaultRoute, search }}
      >
        <Icon name="icon-filled-chevron-small-left" />
        <span className="text-label-medium padding-left-small">
          {translate("Label.SupportCenter")}
        </span>
      </Link>
      <TicketDetails universeId={Number.parseInt(universeId, 10)} ticketId={ticketId} />
    </div>
  );
};

const SupportCenterHome: React.FC = () => {
  const { translate } = useTranslation();
  const { search } = useLocation();
  const { isTicketInaccessible } = useSupportCenterContext();

  const params = new URLSearchParams(search);
  const sourceType = params.get("sourceType");
  const sourceId = params.get("sourceId");
  const sourceUrl = getSourceUrl(sourceType, sourceId);

  const deviceMeta = getDeviceMeta();
  // don't show breadcrumb navigation in app since the help & safety page is rendered in Lua
  const isInApp = deviceMeta?.isInApp ?? false;

  return (
    <div>
      <div>
        {!isInApp && (
          <div className="margin-bottom-small">
            <span className="text-body-medium">
              <a href="/help-safety">{translate("Label.HelpAndSafety")}</a>
              {BREADCRUMB_SEPARATOR}
            </span>
            <span className="text-title-medium">{translate("Label.SupportCenter")}</span>
          </div>
        )}
        <div className="flex items-center">
          <h1 className="text-heading-medium">{translate("Label.SupportCenter")}</h1>
          <Badge className="margin-left-[10px]" label={translate("Label.Beta")} />
        </div>
        <p className="text-body-medium">{translate("Description.SupportCenterIntro")}</p>
      </div>
      {isTicketInaccessible && sourceUrl && sourceType && (
        <FeedbackBanner
          className="margin-top-medium"
          variant="Emphasis"
          title={translate("Message.PrivateTicket")}
          description={translate("Message.ViewYourTicketsBelow")}
          linkHref={sourceUrl}
          linkLabel={translate(SOURCE_LINK_LABEL_TRANSLATION_KEYS[sourceType] ?? "Action.Back")}
        />
      )}
      <TicketList />
    </div>
  );
};

const SupportCenterContainer: React.FC = () => {
  const { SystemFeedbackComponent } = useSystemFeedback();

  return (
    <div className="margin-x-medium margin-bottom-medium">
      <HashRouter hashType="hashbang">
        <SupportCenterProvider>
          <Switch>
            <Route
              exact
              path={routes.ticketRoute}
              render={({ match }) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                const { universeId, ticketId } = match.params as TicketRouteParams;
                return <SupportCenterTicket universeId={universeId} ticketId={ticketId} />;
              }}
            />
            <Route path={routes.defaultRoute} component={SupportCenterHome} />
          </Switch>
        </SupportCenterProvider>
      </HashRouter>
      <SystemFeedbackComponent />
    </div>
  );
};

export default SupportCenterContainer;
