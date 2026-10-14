import React from "react";
import { useTranslation } from "react-utilities";
import { Badge, Button, Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
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
  const { translate, intl } = useTranslation();
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

  const authorizedOnDate = intl
    .getDateTimeFormatter()
    .getCustomDateTime(authorization.lastConsentedUtc ?? authorization.createdUtc, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <React.Fragment>
      {removeAuthorizationModal}
      {reportAuthorizationModal}
      <li className="flex flex-col gap-medium padding-large medium:flex-row medium:items-center medium:justify-between">
        <div className="flex flex-col gap-xsmall min-width-0">
          <div className="flex items-center gap-small min-width-0">
            <span className="text-title-medium content-emphasis text-truncate-end">
              {authorization.application.name}
            </span>
            <Tooltip position="bottom-center" title={getScopeAuthorizationsDescription()}>
              <TooltipTrigger asChild>
                <Badge
                  tabIndex={0}
                  className="shrink-0 cursor-pointer focus-visible:outline-focus"
                  variant="Neutral"
                  size="Small"
                  label={translate(appPermissionsTranslationConstants.permissionsCountLabel, {
                    permissionCount: authorization.scopes.length,
                  })}
                />
              </TooltipTrigger>
            </Tooltip>
          </div>
          <span className="text-body-medium content-default text-truncate-end">
            {authorization.application.summary ||
              translate(appPermissionsTranslationConstants.noDescriptionLabel)}
          </span>
          <span className="text-caption-medium content-muted">
            {translate(appPermissionsTranslationConstants.authorizedOn, {
              date: authorizedOnDate,
            })}
          </span>
        </div>
        <div className="flex gap-small shrink-0">
          <Button
            size="Small"
            variant="Standard"
            onClick={() => removeAuthorizationModalService.open()}
          >
            {translate(appPermissionsTranslationConstants.removeLabel)}
          </Button>
          <Button
            size="Small"
            variant="Standard"
            onClick={() => reportAuthorizationModalService.open()}
          >
            {translate(appPermissionsTranslationConstants.reportLabel)}
          </Button>
        </div>
      </li>
    </React.Fragment>
  );
};

export default AuthorizationRow;
