import { AccessManagementUpsellV2Service } from "Roblox";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import baseApi from "../../apis/common/baseApi";
import AMPFeaturesConstants from "../constants/AMPFeaturesConstants";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import ApiCacheTag from "../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../redux/hooks";
import parentalControlsEventService from "../services/eventServices/parentalControlsEventService";

export const useHandleParentLinking = (): (() => void) => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const dispatch = useAppDispatch();

  const invalidateCachedData = () => {
    const invalidCacheTags = [ApiCacheTag.ParentInfo];
    const invalidateAction = baseApi.util.invalidateTags(invalidCacheTags);
    dispatch(invalidateAction);
  };

  const handleParentLinking = async () => {
    parentalControlsEventService.authButtonClickSettingsPControlsAddParent();
    const parentLinkingFeatureParams = {
      featureName: AMPFeaturesConstants.allowParentLinkingAMPFeature,
    };
    try {
      await AccessManagementUpsellV2Service.startAccessManagementUpsell(parentLinkingFeatureParams);
    } catch (error) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    } finally {
      invalidateCachedData();
    }
  };

  return handleParentLinking;
};

export default useHandleParentLinking;
