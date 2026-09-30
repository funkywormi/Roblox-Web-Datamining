import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import baseApi from "../../apis/common/baseApi";
import ApiCacheTag from "../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../redux/hooks";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import parentalControlsEventService from "../services/eventServices/parentalControlsEventService";
import { startOnDeviceParentLink } from "./startStandaloneParentLink";

/**
 * Starts standalone on-device parent setup in the amp-v2 wizard.
 */
const useStartOnDeviceParentLinking = (): (() => void) => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const dispatch = useAppDispatch();

  return () => {
    parentalControlsEventService.authButtonClickSettingsPControlsAddParent();
    startOnDeviceParentLink(translate)
      .then(result => {
        // An empty flowId is a start that never opened. A real flowId already showed its own UI,
        // including an in-flow error, and may have changed parent state.
        if (result.flowId === "") {
          if (result.reason === "Error") {
            snackbarService.warning(translate(commonTranslationConstants.unknownError));
          }
          return;
        }
        dispatch(
          baseApi.util.invalidateTags([ApiCacheTag.OdpChildContext, ApiCacheTag.ParentInfo]),
        );
      })
      .catch(() => {
        // startWizard resolves on every exit, so there is nothing to recover from here.
      });
  };
};

export default useStartOnDeviceParentLinking;
