import React, { useEffect } from "react";
import { Loading } from "react-style-guide";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";
import LinkedParentsList from "./LinkedParentsList";
import ParentLinkEntrypoint from "./ParentLinkEntrypoint";
import SentRequestsList from "./SentRequestsList";
import ChildWelcomeWithoutParentLinking from "./ChildWelcomeWithoutParentLinking";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";

export const ChildDashboardLandingPage = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: parentInfo, status, isLoading } = useGetParentInfoQuery();

  useEffect(() => {
    if (status === QueryStatus.rejected || (status === QueryStatus.fulfilled && !parentInfo)) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [parentInfo, status]);

  if (isLoading) {
    return <Loading />;
  }

  if (parentInfo?.parents && parentInfo?.parents.length > 0) {
    return (
      <React.Fragment>
        <LinkedParentsList />
        <SentRequestsList />
      </React.Fragment>
    );
  }

  if (parentInfo?.canAddParent) {
    return <ParentLinkEntrypoint />;
  }

  return <ChildWelcomeWithoutParentLinking />;
};

export default ChildDashboardLandingPage;
