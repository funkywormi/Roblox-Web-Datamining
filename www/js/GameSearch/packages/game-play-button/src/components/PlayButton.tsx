import React, { useCallback, useEffect, useState } from "react";
import { useQuery, QueryClientProvider } from "@tanstack/react-query";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { Button, Loading } from "@rbx/core-ui/legacy/react-style-guide";
import { queryClient } from "@rbx/core-scripts/react";
import * as NavigationService from "@rbx/navigation";
import ExperimentationService from "@rbx/experimentation";
import { ValidHttpUrl } from "@rbx/core-scripts/util/url";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import playButtonService from "../services/playButtonService";
import {
  TAppsFlyerReferralProperties,
  TPlayabilityStatus,
  TPlayabilityStatuses,
  TShowAgeVerificationOverlayResponse,
  TUniversePlaceVoiceEnabledSettings,
  ValueOf,
  type TPlayButtonPageContext,
} from "../types/playButtonTypes";
import {
  handleShareLinkEventLogging,
  launchGame,
  launchLogin,
  startAvatarVideoOptInOverlayFlow,
  startVerificationFlow,
  startVoiceOptInOverlayFlow,
} from "../utils/playButtonUtils";
import ExperienceApprovalActionNeededButton from "./ExperienceApprovalActionNeededButton";
import ParentalControlsActionNeededButton from "./ParentalControlsActionNeededButton";
import PurchaseButton from "./PurchaseButtonContainer";
import { DemoButton } from "./DemoButton";
import UnplayableButton from "./UnplayableButton";
import useLaunchGameWithPlayableUxTreatment from "../hooks/useLaunchGameWithPlayableUxTreatment";
import usePurchaseProductData from "../hooks/usePurchaseProductData";
import { AgeCheckNeededButton } from "./AgeCheckNeededButton";

const { counterEvents, avatarChatUpsellLayer, avatarChatUpsellLayerU13 } = playButtonConstants;

const getShowIdentityVerificationFlow = async (
  universeId: string,
): Promise<TShowAgeVerificationOverlayResponse> => {
  const defaultUniverseSettings: TUniversePlaceVoiceEnabledSettings = {
    isUniverseEnabledForVoice: false,
    isUniverseEnabledForAvatarVideo: false,
  };

  if (!authenticatedUser.isAuthenticated) {
    return {
      elegibleToSeeVoiceUpsell: false,
      universePlaceVoiceEnabledSettings: defaultUniverseSettings,
      showAgeVerificationOverlay: false,
      showVoiceOptInOverlay: false,
      showAvatarVideoOptInOverlay: false,
      requireExplicitVoiceConsent: true,
      useCameraU13Design: false,
      useVoiceUpsellV2Design: false,
    };
  }

  const {
    playButtonOverlayWebFlag,
    voiceOptInWebFlag,
    cameraOptInWebFlag: cameraOptInWebFlagO13,
    cameraOptInWebFlagU13,
    requireExplicitVoiceConsent,
    useCameraU13Design,
    useVoiceUpsellV2Design,
  } = await playButtonService.getGuacPlayButtonUI(); // TODO(ACCMAN-4355): migrate to useGuacPlayButtonUI hook for caching

  // TODO: remove this check if playButtonOverlayWebFlag is always true
  if (!playButtonOverlayWebFlag && !(voiceOptInWebFlag || cameraOptInWebFlagO13)) {
    return {
      elegibleToSeeVoiceUpsell: false,
      universePlaceVoiceEnabledSettings: defaultUniverseSettings,
      showAgeVerificationOverlay: false,
      showVoiceOptInOverlay: false,
      showAvatarVideoOptInOverlay: false,
      requireExplicitVoiceConsent,
      useCameraU13Design,
      useVoiceUpsellV2Design,
    };
  }

  const {
    showAgeVerificationOverlay,
    showVoiceOptInOverlay,
    showAvatarVideoOptInOverlay,
    elegibleToSeeVoiceUpsell,
    universePlaceVoiceEnabledSettings,
  } = await playButtonService.getShowAgeVerificationOverlay(universeId);

  let shouldShowUpsellO13 = false;
  let shouldShowUpsellU13 = false;

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ExperimentationService.getAllValuesForLayer) {
    shouldShowUpsellO13 = Boolean(
      (await ExperimentationService.getAllValuesForLayer(avatarChatUpsellLayer)).ShouldShowUpsell,
    );

    shouldShowUpsellU13 = Boolean(
      (await ExperimentationService.getAllValuesForLayer(avatarChatUpsellLayerU13))
        .ShouldShowUpsell,
    );
  }

  return {
    elegibleToSeeVoiceUpsell,
    universePlaceVoiceEnabledSettings,
    showAgeVerificationOverlay: playButtonOverlayWebFlag && showAgeVerificationOverlay,
    showVoiceOptInOverlay: voiceOptInWebFlag && showVoiceOptInOverlay,
    showAvatarVideoOptInOverlay:
      showAvatarVideoOptInOverlay &&
      ((cameraOptInWebFlagO13 && shouldShowUpsellO13) ||
        (cameraOptInWebFlagU13 && shouldShowUpsellU13)),
    requireExplicitVoiceConsent,
    useCameraU13Design,
    useVoiceUpsellV2Design,
  };
};

const getJoindata = (launchDataFromProps?: string) => {
  // Allow launchData to be passed from props for direct joins
  const launchData =
    new URLSearchParams(window.location.search).get("launchData") ?? launchDataFromProps;
  const eventId = new URLSearchParams(window.location.search).get("eventId") ?? undefined;
  return {
    launchData,
    eventId,
  };
};

const EMPTY_OBJECT = {} as const;

export type TPlayButtonProps = {
  universeId: string;
  placeId: string;
  rootPlaceId?: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  eventProperties?: Record<string, string | number | undefined>;
  appsFlyerReferralProperties?: TAppsFlyerReferralProperties;
  status: TPlayabilityStatuses["Playable"] | TPlayabilityStatuses["GuestProhibited"];
  disableLoadingState?: boolean;
  buttonText?: string | undefined;
  hideIcon?: boolean;
  analyticsCallback?: () => void;
  pageContext: TPlayButtonPageContext;
};

const PlayButtonContents = ({
  universeId,
  placeId,
  rootPlaceId,
  privateServerLinkCode,
  gameInstanceId,
  status,
  eventProperties = EMPTY_OBJECT,
  appsFlyerReferralProperties = EMPTY_OBJECT,
  iconClassName = "icon-common-play",
  buttonWidth = Button.widths.full,
  buttonClassName = "btn-common-play-game-lg",
  disableLoadingState = false,
  buttonText = undefined,
  hideIcon = false,
  analyticsCallback = undefined,
  pageContext,
}: TPlayButtonProps) => {
  const [isExperienceVoiceEnabled, setIsExperienceVoiceEnabled] = useState<boolean | undefined>(
    undefined,
  );
  const [showVerification, setShowVerification] = useState<boolean | undefined>(undefined);
  const [elegibleToSeeVoiceUpsell, setElegibleToSeeVoiceUpsell] = useState<boolean | undefined>(
    undefined,
  );
  const [showVoiceOptIn, setShowVoiceOptIn] = useState<boolean | undefined>(undefined);
  const [showAvatarVideoOptIn, setShowAvatarVideoOptIn] = useState<boolean | undefined>(undefined);
  const [requireExplicitVoiceConsent, setRequireExplicitVoiceConsent] = useState<
    boolean | undefined
  >(undefined);
  const [useCameraU13Design, setUseCameraU13Design] = useState<boolean | undefined>(undefined);
  const [useVoiceUpsellV2Design, setUseVoiceUpsellV2Design] = useState<boolean | undefined>(
    undefined,
  );

  const { data: isVNGRedirectEnabled } = useQuery({
    queryKey: ["getIsVNGLandingRedirectEnabled"],
    queryFn: NavigationService.getIsVNGLandingRedirectEnabled,
    retry: false,
  });

  useEffect(() => {
    const fetchShowIdentityVerificationFlow = async () => {
      try {
        const showIdentityVerificationFlow = await getShowIdentityVerificationFlow(universeId);
        setIsExperienceVoiceEnabled(
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          showIdentityVerificationFlow.universePlaceVoiceEnabledSettings
            .isUniverseEnabledForVoice ?? false,
        );
        setElegibleToSeeVoiceUpsell(showIdentityVerificationFlow.elegibleToSeeVoiceUpsell);
        setShowVerification(showIdentityVerificationFlow.showAgeVerificationOverlay);
        setShowVoiceOptIn(showIdentityVerificationFlow.showVoiceOptInOverlay);
        setShowAvatarVideoOptIn(showIdentityVerificationFlow.showAvatarVideoOptInOverlay);
        setRequireExplicitVoiceConsent(showIdentityVerificationFlow.requireExplicitVoiceConsent);
        setUseCameraU13Design(showIdentityVerificationFlow.useCameraU13Design);
        setUseVoiceUpsellV2Design(showIdentityVerificationFlow.useVoiceUpsellV2Design);
      } catch {
        window.EventTracker?.fireEvent(counterEvents.PlayButtonShowIdentificationError);
        setElegibleToSeeVoiceUpsell(false);
        setIsExperienceVoiceEnabled(false);
        setShowVerification(false);
        setShowVoiceOptIn(false);
        setShowAvatarVideoOptIn(false);
        setRequireExplicitVoiceConsent(true); // assume consent is required
        setUseCameraU13Design(false); // TODO: EXPR-907 clean up useCameraU13Design
        setUseVoiceUpsellV2Design(false);
      }
    };

    // eslint-disable-next-line no-void
    void fetchShowIdentityVerificationFlow();
    // TODO: old, migrated code
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doGameLaunch = useCallback(() => {
    handleShareLinkEventLogging(placeId, universeId);

    const joinData = getJoindata(
      eventProperties.launchData != null ? String(eventProperties.launchData) : undefined,
    );

    launchGame(
      placeId,
      rootPlaceId,
      privateServerLinkCode,
      gameInstanceId,
      eventProperties,
      joinData,
      appsFlyerReferralProperties,
    );
  }, [
    placeId,
    universeId,
    eventProperties,
    appsFlyerReferralProperties,
    rootPlaceId,
    privateServerLinkCode,
    gameInstanceId,
  ]);

  const { doGameLaunchWithPlayableUxTreatment, playableUxTreatmentModal } =
    useLaunchGameWithPlayableUxTreatment(universeId, doGameLaunch, pageContext);

  if (showVerification === undefined && !disableLoadingState) {
    return <Loading />;
  }

  return (
    <React.Fragment>
      <Button
        data-testid="play-button"
        width={buttonWidth}
        className={buttonClassName}
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async e => {
          e.preventDefault();
          e.stopPropagation();

          if (status === PlayabilityStatus.Playable) {
            if (elegibleToSeeVoiceUpsell && isExperienceVoiceEnabled) {
              const layerName = "SocialVoice.VoiceUpsell";
              // you must fetch ixp layer values before sending exposure event.
              const ixpPromise = ExperimentationService.getAllValuesForLayer(layerName);
              ixpPromise
                .then(() => {
                  ExperimentationService.logLayerExposure(layerName);
                })
                .catch(() => {
                  console.error("error logging exposure event in play-join");
                });
            }

            if (showVerification) {
              const [_, didVerifyAge] = await startVerificationFlow();
              if (didVerifyAge) {
                setShowVerification(false);
              }
            } else if (showVoiceOptIn) {
              const success = await startVoiceOptInOverlayFlow(
                requireExplicitVoiceConsent ?? true,
                useVoiceUpsellV2Design ?? false,
              );
              if (success) {
                setShowVoiceOptIn(false);
              }
            } else if (showAvatarVideoOptIn) {
              const success = await startAvatarVideoOptInOverlayFlow(
                requireExplicitVoiceConsent ?? true,
                useCameraU13Design ?? true,
              );
              if (success) {
                setShowAvatarVideoOptIn(false);
              }
            }

            doGameLaunchWithPlayableUxTreatment();
          } else if (
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            status === PlayabilityStatus.GuestProhibited
          ) {
            // if it is vng, redirect user to login page directly
            if (isVNGRedirectEnabled) {
              // redirct to login page
              NavigationService.navigateToLoginWithRedirect();
            } else {
              launchLogin(placeId, appsFlyerReferralProperties);
            }
          }

          if (analyticsCallback) {
            analyticsCallback();
          }
        }}
      >
        {!hideIcon && <span className={iconClassName} />}
        {buttonText && <span className="play-button-text">{buttonText}</span>}
      </Button>
      <div id="id-verification-container" />
      {playableUxTreatmentModal}
    </React.Fragment>
  );
};

export const PlayButton = (props: TPlayButtonProps): React.JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <PlayButtonContents {...props} />
  </QueryClientProvider>
);

export type TDefaultPlayButtonProps = {
  placeId: string;
  rootPlaceId?: string;
  universeId: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  refetchPlayabilityStatus: () => void;
  playabilityStatus: TPlayabilityStatus | undefined;
  demoModeAvailable?: boolean;
  hideButtonText?: boolean;
  eventProperties?: Record<string, number | string | undefined>;
  appsFlyerReferralProperties?: TAppsFlyerReferralProperties;
  disableLoadingState?: boolean;
  buttonClassName?: string;
  redirectPurchaseUrl?: ValidHttpUrl;
  showDefaultPurchaseText?: boolean;
  shouldShowVpcPlayButtonUpsells?: boolean;
  pageContext: TPlayButtonPageContext;
};

export const DefaultPlayButton = ({
  placeId,
  rootPlaceId,
  universeId,
  privateServerLinkCode,
  gameInstanceId,
  refetchPlayabilityStatus,
  playabilityStatus,
  demoModeAvailable,
  hideButtonText,
  eventProperties = EMPTY_OBJECT,
  appsFlyerReferralProperties = EMPTY_OBJECT,
  disableLoadingState,
  buttonClassName,
  redirectPurchaseUrl,
  showDefaultPurchaseText,
  shouldShowVpcPlayButtonUpsells,
  pageContext,
}: TDefaultPlayButtonProps): React.JSX.Element => {
  const { fireEvent } = window.EventTracker ?? {};

  // Share the purchase button's product-data loading (react-query dedupes the
  // fetch) so Play Demo is withheld until the purchase button is ready, rather
  // than showing next to a spinner.
  const isPurchaseStatus =
    playabilityStatus === PlayabilityStatus.PurchaseRequired ||
    playabilityStatus === PlayabilityStatus.FiatPurchaseRequired;
  const { isLoading: isPurchaseProductLoading } = usePurchaseProductData(
    universeId,
    placeId,
    isPurchaseStatus,
  );

  const demoButton = demoModeAvailable ? (
    <DemoButton
      universeId={universeId}
      placeId={placeId}
      rootPlaceId={rootPlaceId}
      privateServerLinkCode={privateServerLinkCode}
      gameInstanceId={gameInstanceId}
      eventProperties={eventProperties}
      appsFlyerReferralProperties={appsFlyerReferralProperties}
    />
  ) : null;

  // Stack the primary button and Play Demo button when a demo is available.
  // showDemo=false keeps the container but holds Play Demo back until the
  // primary button has loaded.
  const withDemoButton = (primaryButton: React.JSX.Element, showDemo = true): React.JSX.Element =>
    demoButton ? (
      <div className="stacked-play-buttons-container">
        {primaryButton}
        {showDemo && demoButton}
      </div>
    ) : (
      primaryButton
    );

  switch (playabilityStatus) {
    case undefined:
      if (!disableLoadingState) {
        return <Loading />;
      }

      return (
        <PlayButton
          universeId={universeId}
          placeId={placeId}
          rootPlaceId={rootPlaceId}
          privateServerLinkCode={privateServerLinkCode}
          gameInstanceId={gameInstanceId}
          status={PlayabilityStatus.Playable}
          eventProperties={eventProperties}
          appsFlyerReferralProperties={appsFlyerReferralProperties}
          disableLoadingState={disableLoadingState}
          buttonClassName={buttonClassName}
          pageContext={pageContext}
        />
      );
    case PlayabilityStatus.Playable:
    case PlayabilityStatus.GuestProhibited:
      return (
        <PlayButton
          universeId={universeId}
          placeId={placeId}
          rootPlaceId={rootPlaceId}
          privateServerLinkCode={privateServerLinkCode}
          gameInstanceId={gameInstanceId}
          status={playabilityStatus}
          eventProperties={eventProperties}
          appsFlyerReferralProperties={appsFlyerReferralProperties}
          disableLoadingState={disableLoadingState}
          buttonClassName={buttonClassName}
          pageContext={pageContext}
        />
      );
    case PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser:
    case PlayabilityStatus.ContextualPlayabilityAgeCheckRequired:
      fireEvent?.(counterEvents.ActionNeeded);
      return (
        <AgeCheckNeededButton
          universeId={universeId}
          buttonClassName={buttonClassName}
          playabilityStatus={playabilityStatus}
          pageContext={pageContext}
        />
      );
    case PlayabilityStatus.PurchaseRequired:
    case PlayabilityStatus.FiatPurchaseRequired:
      return withDemoButton(
        <PurchaseButton
          refetchPlayabilityStatus={refetchPlayabilityStatus}
          universeId={universeId}
          placeId={placeId}
          hideButtonText={hideButtonText}
          buttonClassName={buttonClassName}
          redirectPurchaseUrl={redirectPurchaseUrl}
          playabilityStatus={playabilityStatus}
          showDefaultPurchaseText={showDefaultPurchaseText}
          pageContext={pageContext}
        />,
        !isPurchaseProductLoading,
      );
    case PlayabilityStatus.FiatPurchaseDeviceRestricted:
    case PlayabilityStatus.ContextualPlayabilityRegionalAvailability:
      fireEvent?.(counterEvents.Unplayable);

      return withDemoButton(
        <UnplayableButton hideButtonText={hideButtonText} buttonClassName={buttonClassName} />,
      );
    case PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls:
      if (shouldShowVpcPlayButtonUpsells) {
        fireEvent?.(counterEvents.ActionNeeded);

        return (
          <ParentalControlsActionNeededButton
            universeId={universeId}
            buttonClassName={buttonClassName}
            placeId={placeId}
            rootPlaceId={rootPlaceId}
            privateServerLinkCode={privateServerLinkCode}
            gameInstanceId={gameInstanceId}
            eventProperties={eventProperties}
            appsFlyerReferralProperties={appsFlyerReferralProperties}
            pageContext={pageContext}
          />
        );
      }

      // If policy is false, fall back to unplayable behavior
      fireEvent?.(counterEvents.Unplayable);

      return <UnplayableButton hideButtonText={hideButtonText} buttonClassName={buttonClassName} />;
    case PlayabilityStatus.ContextualPlayabilityRequireParentApproval:
      if (shouldShowVpcPlayButtonUpsells) {
        fireEvent?.(counterEvents.ActionNeeded);

        return (
          <ExperienceApprovalActionNeededButton
            universeId={universeId}
            buttonClassName={buttonClassName}
            pageContext={pageContext}
          />
        );
      }

      fireEvent?.(counterEvents.Unplayable);

      return <UnplayableButton hideButtonText={hideButtonText} buttonClassName={buttonClassName} />;
    case PlayabilityStatus.UnplayableOtherReason:
    case PlayabilityStatus.GameUnapproved:
    case PlayabilityStatus.IncorrectConfiguration:
    case PlayabilityStatus.UniverseRootPlaceIsPrivate:
    case PlayabilityStatus.InsufficientPermissionFriendsOnly:
    case PlayabilityStatus.InsufficientPermissionGroupOnly:
    case PlayabilityStatus.DeviceRestricted:
    case PlayabilityStatus.UnderReview:
    case PlayabilityStatus.AccountRestricted:
    case PlayabilityStatus.TemporarilyUnavailable:
    case PlayabilityStatus.ComplianceBlocked:
    case PlayabilityStatus.ContextualPlayabilityRegionalCompliance:
    case PlayabilityStatus.ContextualPlayabilityAgeGated:
    case PlayabilityStatus.PlaceHasNoPublishedVersion:
    case PlayabilityStatus.ContextualPlayabilityUnrated:
    case PlayabilityStatus.ContextualPlayabilityAgeGatedByDescriptor:
    case PlayabilityStatus.ContextualPlayabilityExperienceBlockedParentalControls:
    case PlayabilityStatus.ContextualPlayabilityCoreGated:
    default:
      fireEvent?.(counterEvents.Unplayable);

      return <UnplayableButton hideButtonText={hideButtonText} buttonClassName={buttonClassName} />;
  }
};
