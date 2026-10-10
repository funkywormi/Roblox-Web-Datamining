import baseApi from "../../apis/common/baseApi";
import ApiCacheTag from "../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../redux/hooks";
import useStartOdpWizard from "./useStartOdpWizard";

const odpFlowName = "ODP";
const managePinRequestType = "ManagePin";
const surface = "ParentalControlsSettings";

export const ManageParentPinAction = {
  Update: "Update",
  Delete: "Delete",
} as const;

export type TManageParentPinAction =
  (typeof ManageParentPinAction)[keyof typeof ManageParentPinAction];

/**
 * Opens PIN management for the on-device parent. The AMP wizard checks their PIN, then redirects to
 * parent actions flow to set a new PIN or confirm the PIN removal.
 */
const useManageParentPin = (): ((action: TManageParentPinAction) => void) => {
  const dispatch = useAppDispatch();
  const startOdpWizard = useStartOdpWizard();

  return (action: TManageParentPinAction) => {
    startOdpWizard({
      flow: {
        name: odpFlowName,
        props: {
          requestType: managePinRequestType,
          requestDetails: { actionType: action },
          isOdpInitiated: true,
        },
      },
      surface,
    })
      .then(() => {
        dispatch(
          baseApi.util.invalidateTags([ApiCacheTag.OdpChildContext, ApiCacheTag.ParentInfo]),
        );
      })
      .catch(() => {
        // startWizard resolves on every exit, so there is nothing to recover from here.
      });
  };
};

export default useManageParentPin;
