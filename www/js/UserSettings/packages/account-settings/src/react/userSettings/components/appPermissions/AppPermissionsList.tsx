import React from "react";
import { Loading } from "react-style-guide";
import { List } from "@rbx/foundation-ui";
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
      <p className="stroke-standard stroke-default radius-large padding-large margin-[0] text-body-medium content-default">
        {translate(appPermissionsTranslationConstants.errorLoadingAuthorizations)}
      </p>
    );
  }

  if (authorizations.length === 0) {
    return (
      <p className="stroke-standard stroke-default radius-large padding-large margin-[0] text-body-medium content-default">
        {translate(appPermissionsTranslationConstants.noAuthorizations)}
      </p>
    );
  }

  return (
    <List className="stroke-standard stroke-default radius-large clip [&>li+li]:[border-top:var(--stroke-standard)_solid_var(--color-stroke-default)]">
      {authorizations.map(authorization => (
        <AuthorizationRow
          key={authorization.authorizationId}
          authorization={authorization}
          scopesConfiguration={scopesConfiguration}
        />
      ))}
    </List>
  );
};

export default AppPermissionsList;
