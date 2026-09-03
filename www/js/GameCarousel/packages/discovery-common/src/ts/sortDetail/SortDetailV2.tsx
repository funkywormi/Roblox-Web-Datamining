import React from "react";
import { RouteComponentProps, useLocation, useHistory } from "react-router-dom";
import SortDetailV2DiscoveyApi from "./discoveryApi/SortDetailV2DiscoveryApi";
import eventStreamConstants, {
  EventStreamMetadata,
  SessionInfoType,
} from "../common/constants/eventStreamConstants";
import usePageReferralTracker from "../common/hooks/usePageReferralTracker";
import { withPageSession } from "../common/utils/PageSessionContext";

export const SortDetailV2 = ({ match }: RouteComponentProps<{ sortName: string }>): JSX.Element => {
  const sortName = decodeURIComponent(match.params.sortName);
  const location = useLocation();
  const history = useHistory();

  usePageReferralTracker(
    eventStreamConstants.sortDetailReferral,
    [
      EventStreamMetadata.Position,
      EventStreamMetadata.SortId,
      EventStreamMetadata.Page,
      EventStreamMetadata.TreatmentType,
      SessionInfoType.HomePageSessionInfo,
    ],
    [],
    {},
    location,
    history,
  );

  return <SortDetailV2DiscoveyApi sortName={sortName} />;
};

export default withPageSession(SortDetailV2);
