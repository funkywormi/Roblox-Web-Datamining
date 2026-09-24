import React, { useEffect } from "react";
import { Loading } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import LinkedParentsList from "./LinkedParentsList";
import ParentLinkEntrypointV2 from "./ParentLinkEntrypointV2";
import ParentLinkEntrypoint from "./ParentLinkEntrypoint";
import SentRequestsList from "./SentRequestsList";
import ChildWelcomeWithoutParentLinking from "./ChildWelcomeWithoutParentLinking";
import useLinkedParentsState from "../../../hooks/useLinkedParentsState";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";

// Landing page for the child-side parental controls dashboard
// Displays the linked parents list, sent requests list, or welcome screen when no parents are linked.
export const ChildDashboardLandingPage = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { isOdpLaunchEnabled, showParentList, showAddParentUpsell, isLoading, hasError } =
    useLinkedParentsState();

  useEffect(() => {
    if (hasError) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [hasError]);

  if (isLoading) {
    return <Loading />;
  }

  if (showParentList) {
    return (
      <React.Fragment>
        <LinkedParentsList />
        <SentRequestsList />
      </React.Fragment>
    );
  }

  if (showAddParentUpsell) {
    return isOdpLaunchEnabled ? <ParentLinkEntrypointV2 /> : <ParentLinkEntrypoint />;
  }

  return <ChildWelcomeWithoutParentLinking />;
};

export default ChildDashboardLandingPage;
