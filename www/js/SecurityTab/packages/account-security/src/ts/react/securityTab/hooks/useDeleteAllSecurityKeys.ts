import { useCallback } from "react";
import { authenticatedUser } from "header-scripts";
import useSecurityTabContext from "./useSecurityTabContext";
import { mapTwoStepVerificationErrorToResource } from "../constants/resources";
import { SecurityTabActionType } from "../store/action";
import { MediaType } from "../../challenge/twoStepVerification";

export interface DeleteAllSecurityKeysReturn {
  deleteAllSecurityKeys: () => Promise<void>;
}

const useDeleteAllSecurityKeys = (): DeleteAllSecurityKeysReturn => {
  const { state, dispatch } = useSecurityTabContext();
  const { resources, requestService } = state;

  const deleteAllSecurityKeys = useCallback(async () => {
    const userId = authenticatedUser.id?.toString() ?? "";

    const listSecurityKeyResult = await requestService.twoStepVerification.listSecurityKey(userId);

    if (listSecurityKeyResult.isError) {
      throw new Error(
        mapTwoStepVerificationErrorToResource(resources, listSecurityKeyResult.error),
      );
    }

    const credentialIDs = listSecurityKeyResult.value.credentials.map(cred => cred.credentialID);

    if (credentialIDs.length > 0) {
      const deleteResult = await requestService.twoStepVerification.deleteSecurityKey(
        userId,
        credentialIDs,
      );

      if (deleteResult.isError) {
        throw new Error(mapTwoStepVerificationErrorToResource(resources, deleteResult.error));
      }

      // Update local state to remove SecurityKey from enabled media types
      dispatch({
        type: SecurityTabActionType.DISABLE_MEDIA_TYPE,
        mediaType: MediaType.SecurityKey,
      });
    }
  }, [resources, requestService, dispatch]);

  return {
    deleteAllSecurityKeys,
  };
};

export default useDeleteAllSecurityKeys;
