import { useRef, useState } from "react";
import { userId } from "@rbx/core-scripts/meta/user";
import { TManageExperience } from "../../../../../../types/parentConsentsTypes";
import baseApi from "../../../../../apis/common/baseApi";
import {
  getApprovedExperiencesCacheTag,
  getBlockedExperiencesCacheTag,
} from "../../../../../apis/experienceBlockingApi";
import { useAppDispatch } from "../../../../../redux/hooks";
import useStartOdpWizard from "../../../../hooks/useStartOdpWizard";

const useManageOdpExperience = () => {
  const dispatch = useAppDispatch();
  const isWizardActiveRef = useRef(false);
  const [isManaging, setIsManaging] = useState(false);
  const startOdpWizard = useStartOdpWizard();

  const manageExperience: TManageExperience = async (universeId, action) => {
    const childUserId = userId();
    if (isWizardActiveRef.current || childUserId === null) {
      return;
    }
    isWizardActiveRef.current = true;
    setIsManaging(true);
    try {
      await startOdpWizard({
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
      });
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
