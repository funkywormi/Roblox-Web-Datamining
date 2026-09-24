import { startWizard } from "@rbx/amp-v2-wizard";
import baseApi from "../../apis/common/baseApi";
import ApiCacheTag from "../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../redux/hooks";

const odpFlowName = "ODP";
const odpUpgradeRequestType = "ManageODPUpgrade";
const odpUpgradeActionType = "Create";
const surface = "ParentalControlsSettings";

/**
 * Starts the flow to upgrade an on-device parent to a fully remote parent account. The wizard mints
 * the ODP session, verifies the parent PIN, then redirects to the email step in parental requests.
 */
const useOdpAccountUpgrade = (): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    startWizard({
      flow: {
        name: odpFlowName,
        props: {
          requestType: odpUpgradeRequestType,
          requestDetails: { actionType: odpUpgradeActionType },
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
