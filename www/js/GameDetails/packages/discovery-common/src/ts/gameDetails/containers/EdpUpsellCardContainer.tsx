import React, { useState } from "react";
import { queryClient, withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import {
  PLAYABILITY_QUERY_KEY,
  usePlayabilityStatus,
  UpsellUxTreatmentEnum,
  TUpsellUxTreatmentData,
} from "@rbx/game-play-button";
import UpsellBanner from "../../homePageUpsellCard/components/UpsellBanner";
import {
  UpsellComponent,
  UpsellEntrySurface,
  UpsellPurpose,
  UpsellStage,
} from "../../homePageUpsellCard/constants/upsellAnalyticsConstants";
import {
  AGE_CHECK_VPC_FEATURE_NAME,
  AGE_CHECK_VPC_NAMESPACE,
  EDP_UPSELL_ICON_CLASS_NAME,
  edpUpsellCounterEvents,
} from "../constants/edpUpsellConstants";
import { edpUpsellTranslationConfig } from "../translation.config";

const isValidUpsellUxTreatmentData = (
  data?: Record<string, string>,
): data is TUpsellUxTreatmentData => {
  if (!data) {
    return false;
  }

  return typeof data.bodyText === "string" && data.bodyText.length > 0;
};

type TEdpUpsellCardContainerProps = {
  universeId: string;
} & WithTranslationsProps;

const EdpUpsellCardContainer = ({
  universeId,
  translate,
}: TEdpUpsellCardContainerProps): JSX.Element | null => {
  const [dismissed, setDismissed] = useState(false);
  const { upsellUxTreatment, isFetchingPlayability } = usePlayabilityStatus(universeId);

  const handleUpsellClick = () => {
    if (!window.Roblox.AccessManagementUpsellV2Service) {
      window.EventTracker?.fireEvent(edpUpsellCounterEvents.AccessManagementServiceMissing);
      return;
    }

    window.Roblox.AccessManagementUpsellV2Service.startAccessManagementUpsell({
      featureName: AGE_CHECK_VPC_FEATURE_NAME,
      namespace: AGE_CHECK_VPC_NAMESPACE,
      isAsyncCall: false,
    })
      .then(success => {
        if (success) {
          // Hide the banner immediately and refetch playability
          setDismissed(true);
          queryClient
            .invalidateQueries({ queryKey: [PLAYABILITY_QUERY_KEY, universeId] })
            .catch(() => {
              window.EventTracker?.fireEvent(
                edpUpsellCounterEvents.InvalidatePlayabilityQueryFailed,
              );
            });
        }
      })
      .catch(error => {
        window.EventTracker?.fireEvent(edpUpsellCounterEvents.StartUpsellFailed);
      });
  };

  if (dismissed || isFetchingPlayability || !upsellUxTreatment) {
    return null;
  }

  // Forward-compatible: only the ageCheckUpsell treatment is currently supported.
  if (upsellUxTreatment.treatment !== UpsellUxTreatmentEnum.AgeCheckUpsell) {
    return null;
  }

  if (!isValidUpsellUxTreatmentData(upsellUxTreatment.data)) {
    return null;
  }

  return (
    <UpsellBanner
      badgePropsArray={[]}
      titleText={upsellUxTreatment.data.bodyText}
      iconClassName={EDP_UPSELL_ICON_CLASS_NAME}
      dismissible={false}
      onDismiss={() => undefined}
      buttonPropsArray={[
        {
          text: translate("Action.Continue"),
          onClick: handleUpsellClick,
          variant: "Standard",
          size: "Medium",
        },
      ]}
      titleTextClassName="text-body-medium"
      hideBackground
      analyticsConfig={{
        upsellEntrySurface: UpsellEntrySurface.ExperienceDetails,
        upsellComponent: UpsellComponent.Banner,
        upsellPurpose: UpsellPurpose.FacialAgeEstimation,
        upsellStage: UpsellStage.Fae,
      }}
    />
  );
};

export default withTranslations(EdpUpsellCardContainer, edpUpsellTranslationConfig);
