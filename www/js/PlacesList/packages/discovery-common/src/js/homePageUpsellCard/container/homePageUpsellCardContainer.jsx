import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import {
  HomePageUpsellCardService,
  UpsellService,
  RealTime,
} from "@rbx/legacy-webapp-types/Roblox";
import UpsellBanner from "../../../ts/homePageUpsellCard/components/UpsellBanner";
import HomePageUpsellCard from "../components/HomePageUpsellCard";
import {
  UpsellCardType,
  UpsellCardComponentType,
  UpsellCardActionType,
} from "../constants/upsellCardConstants";
import {
  contactMethodPromptOrigins,
  contactMethodPromptSections,
} from "../constants/upsellCardEventStreamConstants";
import getCardComponentType from "../utils/upsellCardUtils";
import useUpsellBannerConfig from "../hooks/useUpsellBannerConfig";
import { recordDismiss } from "../services/accountInfoService";
import { AmpFeatureName, AmpNamespace, FaeRealtimeNamespace } from "../constants/faeConstants";
import {
  UpsellEntrySurface,
  UpsellComponent,
} from "../../../ts/homePageUpsellCard/constants/upsellAnalyticsConstants";

const defaultUpsellCardV2Config = {};

function HomePageUpsellCardContainer({ translate }) {
  const { ContactMethodMandatoryEmailPhone } = UpsellCardType;
  const [upsellCardContext, setUpsellCardContext] = useState(null);
  const [titleTextOverride, setTitleTextOverride] = useState("");
  const [bodyTextOverride, setBodyTextOverride] = useState("");
  const [requireExplicitVoiceConsent, setRequireExplicitVoiceConsent] = useState(false);
  const [upsellCardV2Config, setUpsellCardV2Config] = useState(defaultUpsellCardV2Config);
  const [upsellDismissed, setUpsellDismissed] = useState(false);

  const clearUpsellCardConfig = useCallback(() => {
    setUpsellCardContext(null);
    setUpsellCardV2Config(defaultUpsellCardV2Config);
    setTitleTextOverride("");
    setBodyTextOverride("");
  }, []);

  const updateUpsellCardContext = useCallback(async () => {
    try {
      const context = await HomePageUpsellCardService.getHomePageUpsellCardVariation();
      const upsellCardType = context?.upsellCardType;
      if (upsellCardType === UpsellCardType.AgeVerificationModal) {
        setUpsellCardContext(context?.upsellCardType);
        setUpsellCardV2Config(context?.upsellCardV2Config);
      } else if (upsellCardType) {
        setUpsellCardContext(context?.upsellCardType);
        setTitleTextOverride(context?.localizedTitleTextOverride);
        setBodyTextOverride(context?.localizedBodyTextOverride);
      } else {
        clearUpsellCardConfig();
      }
    } catch (error) {
      console.error(`Error getting the upsell card variation ${error}`);
      clearUpsellCardConfig();
    }
  }, [clearUpsellCardConfig]);

  useEffect(() => {
    const updateRequireExplicitVoiceConsent = async () => {
      try {
        const voicePolicy = await HomePageUpsellCardService.getVoicePolicy();
        if (voicePolicy?.requireExplicitVoiceConsent != null) {
          setRequireExplicitVoiceConsent(voicePolicy?.requireExplicitVoiceConsent);
        }
      } catch (error) {
        console.error(`Error reading policy for homepage upsellcard ${error}`);
        // Fail compliantly if we can't reach GUAC
        setRequireExplicitVoiceConsent(true);
      }
    };

    updateUpsellCardContext();
    updateRequireExplicitVoiceConsent();
    // this effect should only run on mount, even if updateUpsellCardContext changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // only returns a cleanup function if there's something to cleanup (realtime subscription)
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (RealTime) {
      const realTimeClient = RealTime.Factory.GetClient();
      const realtimeHandler = () => {
        updateUpsellCardContext();
      };
      realTimeClient.Subscribe(FaeRealtimeNamespace, realtimeHandler);
      return () => {
        realTimeClient.Unsubscribe(FaeRealtimeNamespace, realtimeHandler);
      };
    }
  }, [updateUpsellCardContext]);

  useEffect(() => {
    if (upsellCardContext === ContactMethodMandatoryEmailPhone) {
      UpsellService?.renderContactMethodPromptModal({
        origin: contactMethodPromptOrigins.homepage,
        section: contactMethodPromptSections.mandatory,
      });
    }
  }, [upsellCardContext]);

  const openFAEUpsell = useCallback(() => {
    if (window.Roblox.AccessManagementUpsellV2Service) {
      window.Roblox.AccessManagementUpsellV2Service.startAccessManagementUpsell({
        featureName: AmpFeatureName,
        namespace: AmpNamespace,
      })
        .then(success => {
          if (success) {
            updateUpsellCardContext();
          }
        })
        .catch(error => {
          console.error("Error in homePageUpsellCardContainer FAE upsell", error);
        });
    }
  }, [updateUpsellCardContext]);

  // if both values are truthy, we should convert this to a boolean so it's stable across renders
  const shouldRecordDismissal = !!(upsellCardContext && upsellCardV2Config);
  const onDismiss = useCallback(() => {
    if (shouldRecordDismissal) {
      recordDismiss(upsellCardContext).catch(error => {
        console.error(`Error recording dismissal for ${upsellCardContext} ${error}`);
      });
    }
    setUpsellDismissed(true);
  }, [upsellCardContext, shouldRecordDismissal]);

  const actionTypeToCallback = {
    [UpsellCardActionType.OpenFAEUpsell]: openFAEUpsell,
    [UpsellCardActionType.Dismiss]: onDismiss,
  };
  const upsellBannerConfig = useUpsellBannerConfig(
    upsellCardContext,
    upsellCardV2Config,
    actionTypeToCallback,
  );

  const cardComponentType = getCardComponentType(upsellCardContext);
  if (upsellDismissed) {
    return null;
  }
  if (cardComponentType === UpsellCardComponentType.UpsellBanner) {
    return (
      <UpsellBanner
        badgePropsArray={upsellBannerConfig.badgePropsArray}
        titleText={upsellBannerConfig.titleText}
        bodyText={upsellBannerConfig.bodyText}
        buttonPropsArray={upsellBannerConfig.buttonPropsArray}
        dismissible={upsellBannerConfig.dismissible}
        iconClassName={upsellBannerConfig.iconClassName}
        onDismiss={onDismiss}
        analyticsConfig={{
          ...upsellBannerConfig.cardTypeAnalyticsFields,
          upsellEntrySurface: UpsellEntrySurface.Homepage,
          upsellComponent: UpsellComponent.Banner,
        }}
      />
    );
  }
  if (cardComponentType === UpsellCardComponentType.HomePageUpsellCard) {
    return (
      <HomePageUpsellCard
        translate={translate}
        cardType={upsellCardContext}
        titleTextOverride={titleTextOverride}
        bodyTextOverride={bodyTextOverride}
        requireExplicitVoiceConsent={requireExplicitVoiceConsent}
        onDismiss={onDismiss}
      />
    );
  }
  return null;
}

HomePageUpsellCardContainer.propTypes = {
  translate: PropTypes.func.isRequired,
};

export default HomePageUpsellCardContainer;
