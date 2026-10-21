import React from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { withPageSession } from "@rbx/discovery-common/session";

import { FriendRequestSnackbar } from "./FriendRequestSnackbar";
import { TopSearchResultsContainer } from "./TopSearchResultsContainer";

export type TopSearchResultsPageProps = {
  translate: TranslateFunction;
};

const TopSearchResultsPage = ({ translate }: TopSearchResultsPageProps) => (
  <React.Fragment>
    <TopSearchResultsContainer translate={translate} />
    <FriendRequestSnackbar translate={translate} />
  </React.Fragment>
);

export default withPageSession(TopSearchResultsPage);
