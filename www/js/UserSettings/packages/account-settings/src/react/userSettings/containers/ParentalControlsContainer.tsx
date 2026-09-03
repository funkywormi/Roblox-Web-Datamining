import { useEffect, useMemo } from "react";
import { useTranslation } from "react-utilities";
import { matchPath, useLocation } from "react-router-dom";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { Loading } from "react-style-guide";
import { useSnackbar } from "@rbx/user-settings";
import useScrollRestoration from "../../common/hooks/useScrollRestoration";
import ParentalControlsPageName from "../../../enums/parentalControls/ParentalControlsPageName";
import { Access } from "../../../types/accessManagementTypes";
import RouterPath from "../../../enums/RouterPath";
import BackLink from "../../common/components/routing/BackLink";
import {
  baseParentalControlsPath,
  getCurrentChild,
  getLinkedChildDetailsPath,
} from "../constants/parentalControls/parentalControlsConstants";
import parentalControlsTranslationConstants from "../constants/contentConstants/parentalControlsTranslationConstants";
import ChildDashboardLandingPage from "../components/parentalControls/childDashboard/ChildDashboardLandingPage";
import ChildDashboardRoutes from "../components/parentalControls/routes/ChildDashboardRoutes";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import ParentDashboardLandingPage from "../components/parentalControls/parentDashboard/ParentDashboardLandingPage";
import ParentDashboardRoutes from "../components/parentalControls/routes/ParentDashboardRoutes";
import { useAppSelector } from "../../redux/hooks";
import {
  selectAllChildPages,
  selectChildDetailLandingPages,
} from "../../apis/slices/childPagesSlice";
import { useGetChildrenInfoQuery } from "../../apis/parentalControlsApi";
import { useGetFeatureAccessQuery } from "../../apis/accessManagementApi";
import AMPFeaturesConstants from "../constants/AMPFeaturesConstants";
import { sendParentalControlsParentPageloadEvent } from "../services/eventServices/parentalControlsEventService";

export const ParentalControlsContainer = (): JSX.Element => {
  const { translate } = useTranslation();
  const location = useLocation();
  const pathNameNoTrailingSlash = location.pathname.replace(/\/$/, "");
  const { snackbarService } = useSnackbar();
  useScrollRestoration();
  const { data: childrenInfo, status: childrenInfoStatus } = useGetChildrenInfoQuery();
  const {
    data: ageOfMajorityResult,
    status: ageOfMajorityStatus,
    isLoading,
  } = useGetFeatureAccessQuery({ featureName: AMPFeaturesConstants.ageOfMajorityAmpFeature });

  const isChild: boolean = useMemo(() => {
    // User is below age of majority
    return ageOfMajorityResult?.access === Access.Denied;
  }, [ageOfMajorityResult]);

  useEffect(() => {
    // Error handling
    const hasError =
      childrenInfoStatus === QueryStatus.rejected ||
      (childrenInfoStatus === QueryStatus.fulfilled && !childrenInfo) ||
      ageOfMajorityStatus === QueryStatus.rejected ||
      (ageOfMajorityStatus === QueryStatus.fulfilled && !ageOfMajorityResult);

    if (hasError) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [ageOfMajorityResult, ageOfMajorityStatus, childrenInfo, childrenInfoStatus]);

  const allParentalControlsPages = useAppSelector(selectAllChildPages);

  // `matchPath` handles `:param` segments so pages with dynamic routes (e.g.
  // `TopGameDetails`) resolve to their own title. Back navigation is derived
  // from `location.pathname` separately by `BackLink`.
  const currentPage = useMemo(
    () =>
      allParentalControlsPages.find(p =>
        matchPath(pathNameNoTrailingSlash, { path: p.path, exact: true }),
      ),
    [allParentalControlsPages, pathNameNoTrailingSlash],
  );

  /* TODO ACCMAN-1915: The current approach is somewhat hacky because the parental controls tab is wrapped in a Switch router within the UserSettingsBaseContainer.
  This router uses exclusive routing, causing only the outer parental controls wrapper container to be displayed.
  Therefore, we need to verify if we're on the parental controls entry page to display the appropriate navigation.
  This issue will be resolved when we refactor the outer router. */
  const isCurrentlyOnParentalControlsEntryPage: boolean = useMemo(() => {
    const isOnParentalControlsLandingPage =
      pathNameNoTrailingSlash.slice(1) === RouterPath.ParentalControls;
    const onlyChild = childrenInfo?.childrenInfoList?.[0];
    const isOnSingleChildDetailView =
      childrenInfo?.childrenInfoList?.length === 1 &&
      onlyChild != null &&
      pathNameNoTrailingSlash === getLinkedChildDetailsPath(onlyChild.userId);
    return isOnParentalControlsLandingPage || isOnSingleChildDetailView;
  }, [pathNameNoTrailingSlash, childrenInfo]);

  // We only show the child display name if we are on a child's subpage, and not on the landing page
  const childDetailLandingPages = useAppSelector(selectChildDetailLandingPages);
  const isInChildSubpage = useMemo(() => {
    if (!childDetailLandingPages) {
      return false;
    }

    const landingPagePaths = childDetailLandingPages.map(page => page.path);
    return !landingPagePaths.some(path => pathNameNoTrailingSlash === path);
  }, [pathNameNoTrailingSlash, childDetailLandingPages]);

  const currentChild = useMemo(
    () => getCurrentChild(pathNameNoTrailingSlash, childrenInfo),
    [pathNameNoTrailingSlash, childrenInfo],
  );

  // Event tracking
  useEffect(() => {
    if (currentChild) {
      // Parent side event tracking
      sendParentalControlsParentPageloadEvent(
        pathNameNoTrailingSlash,
        currentChild,
        allParentalControlsPages,
      );
    }
  }, [pathNameNoTrailingSlash, currentChild, allParentalControlsPages]);

  const getParentalControlsInnerComponent = (): JSX.Element => {
    if (isLoading) {
      return <Loading />;
    }
    if (isChild) {
      return <ChildDashboardLandingPage />;
    }
    return <ParentDashboardLandingPage />;
  };

  return (
    <div className="settings-container-v2">
      <div className="settings-v2-header" id="rbx-parental-controls-header">
        <h2>
          {translate(
            parentalControlsTranslationConstants.pageTitles[
              ParentalControlsPageName.ParentalControlsEntrypoint
            ],
          )}
        </h2>
      </div>

      {/* Only show the child display name if we are on a child's subpage */}
      {isInChildSubpage && currentChild && (
        <div className="small text child-display-name">
          {translate(parentalControlsTranslationConstants.childAccountName, {
            name: currentChild?.displayName,
          })}
        </div>
      )}

      {/* Only show the back button if we are within parental controls subpages */}
      {!isCurrentlyOnParentalControlsEntryPage && (
        <BackLink
          basePath={baseParentalControlsPath}
          titleTranslationKey={currentPage?.titleTranslationKey}
          currentPagePath={pathNameNoTrailingSlash}
        />
      )}

      {isCurrentlyOnParentalControlsEntryPage && getParentalControlsInnerComponent()}
      {/* Scope the wildcard redirect so it does not intercept valid parent routes. */}
      {isChild && <ChildDashboardRoutes />}
      <ParentDashboardRoutes />
    </div>
  );
};

export default ParentalControlsContainer;
