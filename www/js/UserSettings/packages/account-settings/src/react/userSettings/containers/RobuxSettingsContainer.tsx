import { Fragment, type JSX } from "react";
import { Route, useLocation } from "react-router-dom";
import { TranslationProvider } from "@rbx/core-scripts/react";
import { toRobuxTransferLimitsInputFromSetting, UserSetting } from "@rbx/user-settings";
import RobuxTransactionsSection from "@rbx/transfer-platform-common/transferManagement/components/RobuxTransactionsSection";
import TransferApprovalsSection from "@rbx/transfer-platform-common/transferManagement/components/TransferApprovalsSection";
import TransferLimitsContainer from "@rbx/transfer-platform-common/transferManagement/containers/TransferLimitsContainer";
import translationConfig from "@rbx/transfer-platform-common/transferManagement/translation.config";
import RouterPath from "../../../enums/RouterPath";
import SettingCategoryPageName from "../../../enums/SettingCategoryPageName";
import useGetSettingsAndOptionsV2 from "../../apis/hooks/useGetSettingsAndOptionsV2";
import RobuxTransferApprovalOptions from "../components/robux/RobuxTransferApprovalOptions";

const robuxSettingsPath = `/${RouterPath.Robux}`;
const transferApprovalsPath = `${robuxSettingsPath}/${SettingCategoryPageName.TransferApprovals}`;

export const RobuxSettingsContainer = (): JSX.Element => {
  const location = useLocation();
  // The settings Switch mounts this container for both /robux and its child paths.
  const isOnRobuxTab = location.pathname.replace(/\/$/, "") === robuxSettingsPath;
  const [settingsAndOptions, isLoading, isError] = useGetSettingsAndOptionsV2(undefined, {
    // The options page reads the setting itself. Skipping here keeps a failed
    // read from reporting twice while that page is open.
    skip: !isOnRobuxTab,
  });
  const approvalModeSetting = settingsAndOptions?.[UserSetting.robuxTransferApprovalMode];

  return (
    <TranslationProvider config={translationConfig}>
      {isOnRobuxTab && (
        <Fragment>
          <TransferLimitsContainer
            storedLimits={{
              caps: settingsAndOptions
                ? toRobuxTransferLimitsInputFromSetting(settingsAndOptions.robuxTransferLimits)
                : undefined,
              isLoading,
              isError,
            }}
          />
          {approvalModeSetting != null && (
            <TransferApprovalsSection
              currentValue={approvalModeSetting.currentValue}
              detailsHref={`#!${transferApprovalsPath}`}
            />
          )}
          <RobuxTransactionsSection />
        </Fragment>
      )}
      <Route path={transferApprovalsPath}>
        <RobuxTransferApprovalOptions />
      </Route>
    </TranslationProvider>
  );
};
