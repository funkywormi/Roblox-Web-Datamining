import React, { useState } from "react";
import { IModalService, NativeDropdown } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { CurrentUser } from "Roblox";
import { useSnackbar } from "@rbx/user-settings";
import { TAuthorization } from "../../../../types/appPermissionsTypes";
import { OAuthAbuseCategory, SafetyEvent } from "../../../../types/abuseReportTypes";
import useSettingsModal from "./useSettingsModal";
import appPermissionsTranslationConstants from "../../../userSettings/constants/contentConstants/appPermissionsTranslationConstants";
import {
  abuseReasons,
  oauthAbuseReportEntryPoint,
  oauthAbuseReportVector,
} from "../../../userSettings/constants/appPermissionsConstants";
import { useReportOAuthApplicationMutation } from "../../../apis/oauthApi";

const useOAuthAbuseReportModal = (authorization: TAuthorization): [JSX.Element, IModalService] => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { reportModal } = appPermissionsTranslationConstants;

  const [selectedAbuseReason, setSelectedAbuseReason] = useState<OAuthAbuseCategory>();
  const [reportDetails, setReportDetails] = useState<string>("");

  const [reportOAuthApplication] = useReportOAuthApplicationMutation();

  const cleanupState = () => {
    setSelectedAbuseReason(undefined);
    setReportDetails("");
  };

  const submitAbuseReport = async () => {
    try {
      const safetyEvent: SafetyEvent = {
        safetyEvent: {
          tags: {
            SUBMITTER_USER_ID: { valueList: [{ data: CurrentUser.userId }] },
            ENTRY_POINT: {
              valueList: [{ data: oauthAbuseReportEntryPoint }],
            },
            OAUTH_APPLICATION_ID: {
              valueList: [{ data: authorization.application.applicationId }],
            },
            REPORTER_COMMENT: {
              valueList: [
                {
                  data: reportDetails,
                },
              ],
            },
            REPORTED_ABUSE_CATEGORY: {
              valueList: [{ data: selectedAbuseReason as string }],
            },
            REPORTED_ABUSE_VECTOR: {
              valueList: [{ data: oauthAbuseReportVector }],
            },
          },
        },
      };
      await reportOAuthApplication(safetyEvent).unwrap();
      snackbarService.success(translate(reportModal.successMessage));
    } catch {
      snackbarService.warning(translate(reportModal.errorMessage));
    }
    cleanupState();
  };

  const abuseReasonDropdownOptions = abuseReasons.map(reason => {
    return {
      key: reason.category,
      label: translate(reason.labelTranslationKey),
      value: reason.category,
    };
  });

  const abuseReasonDropdown = (
    <NativeDropdown
      selectionItems={abuseReasonDropdownOptions}
      selectedItemvalue={selectedAbuseReason ?? translate(reportModal.dropdownPlaceholder)}
      className="input-group-btn col-xs-12 col-sm-6 app-abuse-report-dropdown"
      onChange={e => setSelectedAbuseReason(e.target.value as OAuthAbuseCategory)}
      placeholder={translate(reportModal.dropdownPlaceholder)}
    />
  );

  const body = (
    <form className="form-horizontal" autoComplete="off" name="oauthAppAbuseReportForm">
      <div className="input-group-btn">{abuseReasonDropdown}</div>

      <div className="form-group">
        <textarea
          id="userReportMessage"
          placeholder={translate(reportModal.textPlaceholder)}
          name="message"
          className="form-control input-field authorization-report-reason"
          maxLength={1000}
          rows={10}
          onChange={e => setReportDetails(e.target.value)}
        >
          {reportDetails}
        </textarea>
      </div>
    </form>
  );

  const [OAuthAbuseReportModal, OAuthAbuseReportModalService] = useSettingsModal({
    translatedTitle: translate(reportModal.title, {
      appName: authorization.application.name,
    }),
    translatedBody: body,
    actionButtonTextResourceId: reportModal.reportBtn,
    disableActionButton: !selectedAbuseReason || !reportDetails,
    onAction: submitAbuseReport,
    size: "md",
    onHide: cleanupState,
  });

  return [OAuthAbuseReportModal, OAuthAbuseReportModalService];
};

export default useOAuthAbuseReportModal;
