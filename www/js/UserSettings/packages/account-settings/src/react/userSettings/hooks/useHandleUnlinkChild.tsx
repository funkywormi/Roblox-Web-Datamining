import { useHistory } from "react-router-dom";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import { baseParentalControlsPath } from "../constants/parentalControls/parentalControlsConstants";
import {
  useGetChildrenInfoQuery,
  useRemoveChildLinkMutation,
} from "../../apis/parentalControlsApi";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";

/**
 * Custom hook that provides a function to unlink a child account.
 *
 * @returns {Function} A function that takes a child user ID as a parameter and unlinks the child account.
 *
 * This hook handles unlinking a child and is passed to UnlinkChildButton.tsx
 * It avoids race conditions when the child's components are unmounted during unlinking.
 */

const useHandleUnlinkChild = (): ((childUserId: number) => void) => {
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();
  const history = useHistory();

  const [removeChildLink] = useRemoveChildLinkMutation();
  const { refetch: refetchChildrenInfo } = useGetChildrenInfoQuery();

  const unlinkChild = async (childUserId: number) => {
    try {
      await removeChildLink(childUserId).unwrap();
      await refetchChildrenInfo().unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));

      // Redirect to main parental controls page
      history.push(baseParentalControlsPath);
    } catch {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  return unlinkChild;
};

export default useHandleUnlinkChild;
