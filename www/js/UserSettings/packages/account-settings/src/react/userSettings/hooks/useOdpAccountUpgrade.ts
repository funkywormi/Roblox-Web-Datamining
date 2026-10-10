import baseApi from "../../apis/common/baseApi";
import ApiCacheTag from "../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../redux/hooks";
import useStartOdpWizard from "./useStartOdpWizard";

const odpFlowName = "ODP";
const odpUpgradeRequestType = "ManageODPUpgrade";
const surface = "ParentalControlsSettings";

export const OdpAccountUpgradeAction = {
  Create: "Create",
  Update: "Update",
} as const;

export type TOdpAccountUpgradeAction =
  (typeof OdpAccountUpgradeAction)[keyof typeof OdpAccountUpgradeAction];

/**
 * Starts the flow to upgrade an on-device parent to a fully remote parent account. The wizard mints
 * the ODP session, verifies the parent PIN, then redirects to the email step in parental requests.
 * Create opens a new upgrade request, Update changes the email on the request already pending.
 */
const useOdpAccountUpgrade = (): ((action: TOdpAccountUpgradeAction) => void) => {
  const dispatch = useAppDispatch();
  const startOdpWizard = useStartOdpWizard();

  return (action: TOdpAccountUpgradeAction) => {
    startOdpWizard({
      flow: {
        name: odpFlowName,
        props: {
          requestType: odpUpgradeRequestType,
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

export default useOdpAccountUpgrade;
