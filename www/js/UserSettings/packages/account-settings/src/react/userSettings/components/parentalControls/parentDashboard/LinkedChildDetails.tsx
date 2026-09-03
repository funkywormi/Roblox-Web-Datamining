import React from "react";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import SettingsList from "../../../../common/components/routing/SettingsList";
import { TSettingsPage } from "../../../../../types/commonTypes";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { useAppSelector } from "../../../../redux/hooks";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import LinkedChildCard from "./LinkedChildCard";
import PendingRequestList from "./PendingRequestPreviewList";
import FriendManagementPreview from "./FriendManagementPreview";
import ScreentimePreview from "./ScreentimePreview";
import TopGamesPreview from "./TopGamesPreview";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import SpendSettingName from "../../../../../enums/SpendSettingName";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";
import { trackError } from "../../../giftRobux/observability";
import GiftRobuxErrorBoundary from "./GiftRobuxErrorBoundary";
import RobuxBalanceSection from "./RobuxBalanceSection";

export const LinkedChildDetails = ({
  child,
  filteredChildCategoryPages,
  shouldDisplayScreenTimeLimit,
}: {
  child: TChildInfo;
  filteredChildCategoryPages: Record<string, TSettingsPage>;
  shouldDisplayScreenTimeLimit: boolean;
}): JSX.Element => {
  const { translate } = useTranslation();
  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));
  const [childSettings] = useGetSettingsAndOptions(child.userId);
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  const canParentViewChildSettingMenu =
    child.canParentAccessChildBasicPrivacySettings ||
    child.canParentViewChildSpendRestrictions ||
    child.canParentViewChildCreatorCollaborationSettings ||
    (childSettings?.[UserSetting.allowFacialAgeEstimation] && uiPolicy?.enableAgeCheckSetting) ||
    child.canParentManageChildsCommunicationSettings ||
    child.canParentManageChildsInExperienceDirectChatSetting ||
    child.canParentManageChildsPresetChatSetting ||
    uiPolicy?.enableParentLinkActivityUpdates;

  const handleRobuxBalanceSectionError = React.useCallback(() => {
    trackError("RobuxBalanceSectionRenderError");
  }, []);

  return (
    <React.Fragment>
      <LinkedChildCard childInfo={child} />
      {childPages && (
        <React.Fragment>
          <div className="rbx-divider" />
          <PendingRequestList childUserId={child.userId} />

          {child.canParentGiftChildRobux && child.robuxBalance !== undefined && (
            <GiftRobuxErrorBoundary fallback={null} onError={handleRobuxBalanceSectionError}>
              <div className="rbx-divider" />
              <RobuxBalanceSection child={child} />
            </GiftRobuxErrorBoundary>
          )}

          {shouldDisplayScreenTimeLimit && (
            <React.Fragment>
              <div className="rbx-divider" />
              <ScreentimePreview child={child} />
              <TopGamesPreview child={child} />
            </React.Fragment>
          )}

          {child.canParentViewChildFriends && (
            <React.Fragment>
              <div className="rbx-divider" />
              <FriendManagementPreview child={child} />
            </React.Fragment>
          )}

          {canParentViewChildSettingMenu && (
            <React.Fragment>
              <div className="rbx-divider" />
              <PreviewCard
                title={translate(parentalControlsTranslationConstants.settingManagement.heading)}
              >
                <SettingsList subPages={filteredChildCategoryPages} isMainMenu />
              </PreviewCard>
            </React.Fragment>
          )}

          {/* Spending insights setings menu should only be displayed if the parent has no access to any other child settings */}
          {!canParentViewChildSettingMenu && child.shouldParentSeeSpendingInsights && (
            <React.Fragment>
              <div className="rbx-divider" />
              <PreviewCard
                title={translate(parentalControlsTranslationConstants.spendingInsights.heading)}
              >
                <SettingsList
                  subPages={{
                    [SpendSettingName.SpendNotifications]: filteredChildCategoryPages[
                      SpendSettingName.SpendNotifications
                    ] as TSettingsPage,
                  }}
                />
              </PreviewCard>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default LinkedChildDetails;
