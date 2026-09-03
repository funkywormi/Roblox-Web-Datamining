import React from "react";
import { useTranslation } from "react-utilities";
import { useAppSelector } from "../../../../redux/hooks";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import ScreentimeChart from "../shared/ScreentimeChart";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";

const ScreentimePreview = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();

  const childUserId = child.userId;
  const canManageScreentime = child.canParentManageChildsScreentime ?? false;

  const childPages = useAppSelector(selectChildPagesForChildUserId(childUserId));

  return (
    <PreviewCard
      title={translate(parentalControlsTranslationConstants.parentalControlsScreentime.heading)}
      linkText={
        canManageScreentime
          ? translate(parentalControlsTranslationConstants.parentalControlsScreentime.manage)
          : undefined
      }
      linkPath={canManageScreentime ? childPages?.screenTimeManagementPage.path : undefined}
      onClick={
        canManageScreentime
          ? () => parentalControlsEventService.authButtonClickSettingsPControlsScreentimeMore(child)
          : undefined
      }
    >
      <ScreentimeChart userId={childUserId} />
    </PreviewCard>
  );
};

export default ScreentimePreview;
