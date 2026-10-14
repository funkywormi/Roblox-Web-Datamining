import React, { useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { Pagination } from "@rbx/foundation-ui";
import { EnabledStatusValue, UserSetting } from "@rbx/user-settings";
import SettingsSection from "../../common/components/SettingsSection";
import appPermissionsTranslationConstants from "../constants/contentConstants/appPermissionsTranslationConstants";
import navigationTranslationConstants from "../constants/contentConstants/navigationTranslationConstants";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import AppPermissionsList from "../components/appPermissions/AppPermissionsList";
import { useGetAuthorizationsQuery, useLazyGetAuthorizationsQuery } from "../../apis/oauthApi";
import appPermissionsConstants from "../constants/appPermissionsConstants";
import useGetSettingsAndOptions from "../../apis/hooks/useGetSettingsAndOptions";
import AllowThirdPartyAppsSetting from "../components/appPermissions/AllowThirdPartyAppsSetting";

export const AppPermissionsContainer = (): JSX.Element => {
  const { translate } = useTranslation();

  const [settingsAndOptions] = useGetSettingsAndOptions();

  const { pageSize } = appPermissionsConstants.pagerConstants;
  const [currentPage, setCurrentPage] = useState(1);

  const { data } = useGetAuthorizationsQuery();
  const [fetchNextAuthorizations] = useLazyGetAuthorizationsQuery();

  const handlePagination = async (pageNumber: number) => {
    if (data?.nextPageCursor) {
      await fetchNextAuthorizations(data?.nextPageCursor);
    }

    setCurrentPage(pageNumber);
  };

  const currentPageAuthorizations = data?.authorizations.slice(
    (currentPage - 1) * pageSize,
    Math.min(currentPage * pageSize, data?.authorizations.length),
  );

  const lastPage = Math.ceil((data?.authorizations.length ?? 1) / pageSize);
  const hasNextPage = data?.nextPageCursor !== undefined || currentPage !== lastPage;

  useEffect(() => {
    // If currentpage > lastPage, then user deleted everything from the last page
    // and we need to move them back to the page that still has items.
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [currentPage, lastPage, data]);

  const appPermissions = (
    <React.Fragment>
      <AppPermissionsList authorizations={currentPageAuthorizations} />
      {data?.authorizations &&
        data?.authorizations?.length > 0 &&
        (hasNextPage || currentPage > 1) && (
          <div className="flex justify-center margin-top-large">
            <Pagination
              aria-label={translate(appPermissionsTranslationConstants.thirdPartyApplications)}
              navType="SinglePage"
              currentPage={currentPage}
              totalPages={hasNextPage ? currentPage + 1 : currentPage}
              onPageChange={handlePagination}
              previousPageLabel={translate(commonTranslationConstants.previous)}
              nextPageLabel={translate(commonTranslationConstants.next)}
            />
          </div>
        )}
    </React.Fragment>
  );

  const appPermissionsWithParentalConsent = (
    <React.Fragment>
      {/* If third party apps disabled by a parent, allow child to request consent */}
      {settingsAndOptions?.[UserSetting.allowThirdPartyAppPermissions]?.currentValue ===
      EnabledStatusValue.Disabled ? (
        <AllowThirdPartyAppsSetting />
      ) : (
        // If third party apps setting doesn't apply to this user, or if the parent enabled third party apps, show the list of apps
        appPermissions
      )}
    </React.Fragment>
  );

  return (
    <div className="settings-container-v2">
      <div className="settings-v2-header" id="rbx-app-permissions-settings-header">
        <h2>{translate(navigationTranslationConstants.appPermissionsHeading)}</h2>
      </div>
      <SettingsSection
        title={translate(appPermissionsTranslationConstants.thirdPartyApplications)}
        description={
          <span className="text-body-medium content-default">
            {translate(appPermissionsTranslationConstants.descriptionV2)}
          </span>
        }
      />
      {appPermissionsWithParentalConsent}
    </div>
  );
};

export default AppPermissionsContainer;
