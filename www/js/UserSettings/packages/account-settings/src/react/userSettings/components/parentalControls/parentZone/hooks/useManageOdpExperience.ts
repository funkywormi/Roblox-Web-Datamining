import { useRef, useState } from "react";
import { userId } from "@rbx/core-scripts/meta/user";
import { startWizard } from "@rbx/amp-v2-wizard";
import { TManageExperience } from "../../../../../../types/parentConsentsTypes";
import baseApi from "../../../../../apis/common/baseApi";
import {
  getApprovedExperiencesCacheTag,
  getBlockedExperiencesCacheTag,
} from "../../../../../apis/experienceBlockingApi";
import { useAppDispatch } from "../../../../../redux/hooks";

const useManageOdpExperience = () => {
  const dispatch = useAppDispatch();
  const isWizardActiveRef = useRef(false);
  const [isManaging, setIsManaging] = useState(false);

  const manageExperience: TManageExperience = async (universeId, action) => {
    const childUserId = userId();
    if (isWizardActiveRef.current || childUserId === null) {
      return;
    }
    isWizardActiveRef.current = true;
    setIsManaging(true);
    try {
      await startWizard({
        flow: {
          name: "ODP",
          props: {
            requestType: "ManageExperience",
            requestDetails: {
              universeId: String(universeId),
              experienceManagementAction: action,
            },
            isOdpInitiated: true,
          },
        },
        surface: "ParentalControlsSettings",
      }).catch(() => undefined);
    } finally {
      // Wizard exit does not indicate whether the action was applied.
      dispatch(
        baseApi.util.invalidateTags([
          getBlockedExperiencesCacheTag(childUserId),
          getApprovedExperiencesCacheTag(childUserId),
        ]),
      );
      isWizardActiveRef.current = false;
      setIsManaging(false);
    }
  };

  return { manageExperience, isManaging };
};

export default useManageOdpExperience;
