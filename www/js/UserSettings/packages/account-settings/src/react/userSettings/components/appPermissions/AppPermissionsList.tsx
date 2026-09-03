import React from "react";
import { Loading } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { TAuthorization } from "../../../../types/appPermissionsTypes";
import appPermissionsTranslationConstants from "../../constants/contentConstants/appPermissionsTranslationConstants";
import { useGetAuthorizationsQuery, useGetScopesQuery } from "../../../apis/oauthApi";
import AuthorizationRow from "./AuthorizationRow";

export const AppPermissionsList = ({
  authorizations,
}: {
  authorizations: TAuthorization[] | undefined;
}): JSX.Element => {
  const { translate } = useTranslation();
  const { isLoading: isAuthorizationsLoading } = useGetAuthorizationsQuery();
  const { data: scopesConfiguration, isLoading: isScopeConfigLoading } = useGetScopesQuery();

  if (isAuthorizationsLoading || isScopeConfigLoading) {
    return <Loading />;
  }

  if (!authorizations) {
    return (
      <p className="app-table-empty section-content">
        {translate(appPermissionsTranslationConstants.errorLoadingAuthorizations)}
      </p>
    );
  }

  if (authorizations.length === 0) {
    return (
      <p className="app-table-empty section-content">
        {translate(appPermissionsTranslationConstants.noAuthorizations)}
      </p>
    );
  }

  return (
    <div className="app-authorization-table">
      <div className="section-content app-authorization-table-body">
        {authorizations &&
          authorizations.map(authorization => (
            <AuthorizationRow
              key={authorization.authorizationId}
              authorization={authorization}
              scopesConfiguration={scopesConfiguration}
            />
          ))}
      </div>
    </div>
  );
};

export default AppPermissionsList;
