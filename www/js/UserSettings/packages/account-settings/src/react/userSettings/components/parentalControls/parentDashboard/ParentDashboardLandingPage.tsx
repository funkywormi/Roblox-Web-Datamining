import React, { useEffect } from "react";
import { Loading } from "react-style-guide";
import { useHistory, useLocation } from "react-router-dom";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import { useGetChildrenInfoQuery } from "../../../../apis/parentalControlsApi";
import ParentDashboardWelcomeScreen from "./ParentDashboardWelcomeScreen";
import LinkedChildrenCardList from "./LinkedChildrenCardList";
import { getLinkedChildDetailsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";

export const ParentDashboardLandingPage = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: childrenInfo, status } = useGetChildrenInfoQuery();
  const history = useHistory();
  const location = useLocation();

  const redirectToLinkedChildDetails = (childUserId: number) => {
    history.push(getLinkedChildDetailsPath(childUserId));
  };

  useEffect(() => {
    if (status === QueryStatus.rejected || (status === QueryStatus.fulfilled && !childrenInfo)) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [childrenInfo, status]);

  useEffect(() => {
    // If there is only one child, redirect to the child details page
    const onlyChild = childrenInfo?.childrenInfoList?.[0];
    if (childrenInfo?.childrenInfoList?.length === 1 && onlyChild) {
      redirectToLinkedChildDetails(onlyChild.userId);
    }
  }, [childrenInfo, location]);

  const innerComponent = (): JSX.Element | undefined => {
    if (!childrenInfo) {
      return <Loading />;
    }
    switch (childrenInfo.childrenInfoList.length) {
      case 0:
        return <ParentDashboardWelcomeScreen />;
      case 1:
        // If there is only one child, redirect to the child details page
        return undefined;
      default:
        return <LinkedChildrenCardList />;
    }
  };

  return <React.Fragment>{innerComponent()}</React.Fragment>;
};

export default ParentDashboardLandingPage;
