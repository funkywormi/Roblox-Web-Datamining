import React from "react";
import { useTranslation } from "react-utilities";
import { Button, Tooltip } from "react-style-guide";
import { useSnackbar } from "@rbx/user-settings";
import appPermissionsConstants, { OIDCScopeTypes } from "../../constants/appPermissionsConstants";
import appPermissionsTranslationConstants from "../../constants/contentConstants/appPermissionsTranslationConstants";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { useDeleteAuthorizationMutation } from "../../../apis/oauthApi";
import useOAuthAbuseReportModal from "../../../common/hooks/modals/useOAuthAbuseReportModal";
import { TAuthorization, TScopesResponse } from "../../../../types/appPermissionsTypes";

export const AuthorizationRow = ({
  authorization,
  scopesConfiguration,
}: {
  authorization: TAuthorization;
  scopesConfiguration?: TScopesResponse;
}): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [deleteAuthorizationMutation] = useDeleteAuthorizationMutation();

  const getScopeAuthorizationsDescription = (): string => {
    const { scopes } = authorization;

    const scopeMessageString = scopes.reduce((previousValue, currentValue, currentIndex) => {
      const { scopeType } = currentValue;
      let scopeTranslationKey: string | undefined;

      const scopeConfig = scopesConfiguration?.scopeTypes.find(
        scopeTypeConfig => scopeTypeConfig.name === scopeType,
      );
      if (scopeConfig) {
        scopeTranslationKey = scopeConfig.translationKey;
      }

      if (scopeType in appPermissionsConstants.oidcScopeTranslationKeys) {
        scopeTranslationKey =
          appPermissionsConstants.oidcScopeTranslationKeys[scopeType as OIDCScopeTypes];
      }

      const translatedString = scopeTranslationKey ? translate(scopeTranslationKey) : scopeType;
      if (currentIndex !== 0) {
        return `${previousValue}, ${translatedString}`;
      }
      return translatedString;
    }, "");

    return translate(appPermissionsTranslationConstants.scopeDescriptionLabel, {
      scopesList: scopeMessageString,
    });
  };

  const deleteAuthorization = async () => {
    try {
      await deleteAuthorizationMutation(authorization.authorizationId).unwrap();
      snackbarService.success(
        translate(appPermissionsTranslationConstants.deleteModal.successMessage, {
          appName: authorization.application.name,
        }),
      );
    } catch {
      snackbarService.warning(
        translate(appPermissionsTranslationConstants.deleteModal.errorMessage),
      );
    }
  };

  const [removeAuthorizationModal, removeAuthorizationModalService] = useSettingsModal({
    titleResourceId: appPermissionsTranslationConstants.deleteModal.title,
    translatedBody: translate(appPermissionsTranslationConstants.deleteModal.body, {
      appName: authorization.application.name,
    }),
    actionButtonTextResourceId: appPermissionsTranslationConstants.removeLabel,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    size: "sm",
    onAction: deleteAuthorization,
  });

  const [reportAuthorizationModal, reportAuthorizationModalService] =
    useOAuthAbuseReportModal(authorization);

  return (
    <React.Fragment>
      {removeAuthorizationModal}
      {reportAuthorizationModal}
      <div className="border-top app-authorization-row">
        <div className="authorization-info">
          <div className="app-info">
            <span className="text-lead text-overflow">{authorization.application.name}</span>
            <Tooltip
              id="permissions-tooltip"
              placement="bottom"
              content={getScopeAuthorizationsDescription()}
            >
              <span className="authorization-info-chip-wrapper">
                <button type="button" className="btn-cta-xs authorization-info-chip" disabled>
                  {translate(appPermissionsTranslationConstants.permissionsCountLabel, {
                    permissionCount: authorization.scopes.length,
                  })}
                </button>
              </span>
            </Tooltip>
          </div>
          <p className="text-overflow font-subheader-2">
            {authorization.application.summary ||
              translate(appPermissionsTranslationConstants.noDescriptionLabel)}
          </p>
        </div>
        <div>
          <Button
            size={Button.sizes.small}
            className="app-authorization-action-btn"
            variant={Button.variants.control}
            width=""
            onClick={() => removeAuthorizationModalService.open()}
          >
            {translate(appPermissionsTranslationConstants.removeLabel)}
          </Button>
          <Button
            size={Button.sizes.small}
            className="app-authorization-action-btn"
            variant={Button.variants.control}
            width=""
            onClick={() => reportAuthorizationModalService.open()}
          >
            {translate(appPermissionsTranslationConstants.reportLabel)}
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AuthorizationRow;
