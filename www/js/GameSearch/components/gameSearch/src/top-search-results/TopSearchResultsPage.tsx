import React from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";

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

export default TopSearchResultsPage;
