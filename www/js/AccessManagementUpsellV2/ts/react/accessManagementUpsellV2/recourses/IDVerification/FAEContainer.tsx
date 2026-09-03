import Persona from 'persona';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme, TranslateFunction } from 'react-utilities';
import {
  CurrentUser,
  DeviceMeta,
  DeepLinkService,
  ExperimentationService,
  Guac,
  TFeatureSpecificData,
  Intl
} from 'Roblox';
import { QRDeepLinkDialog } from '@rbx/identity-verification';
import openVerificationLink from '../../utils/verificationUtils';
import VerificationCompletePage from './components/VerificationCompletePage';
import FAEQRCodeContainer from './FAEQRCodeContainer';
import useExperiments from '../../hooks/useExperiments';
import { faeQrCodeExperimentLayer } from '../../accessManagement/constants/experimentConstants';
import { ModalEvent } from '../../accessManagement/constants/viewConstants';
import {
  fetchFeatureAccess,
  selectAmpFeatureCheckData,
  selectFeatureAccess,
  selectFeatureName,
  selectNamespace
} from '../../accessManagement/accessManagementSlice';
import LoadingPage from '../../accessManagement/components/LoadingPage';
import { VerificationStatusCode, FlowType, Access } from '../../enums';
import { useAppDispatch } from '../../store';
import FAEEventConstants from './constants/eventConstants';
import { HeadingConstants, LabelConstants } from './constants/textConstants';
import {
  sendFAEModalShownEvent,
  sendFAEButtonClickEvent,
  sendFAEFormInteractionEvent,
  sendFAEMessageShownEvent,
  sendFAEPageLoadEvent
} from './services/FaeEventService';
import {
  fetchIDVerificationStatus,
  resetVerificationStore,
  selectIDVState,
  selectLoading,
  setLoading,
  startIDVerification,
  VerificationStatus
} from './verificationSlice';

type TAmpWizardPolicy = {
  faeMobileWebDeeplinkEnabled: boolean;
  faeDesktopDeeplinkEnabled: boolean;
};

// Constants
const DEFAULT_THEME = 'dark';
const EMBEDDED_FLOW_POLLING_INTERVAL = 200; // .2 seconds
const EMBEDDED_FLOW_POLLING_TIMEOUT = 30000; // 30 seconds
const POLLING_INTERVAL = 10000; // 10 seconds
const POLLING_TIMEOUT = 1800000; // 30 minutes
const FAERecourse = 'AgeEstimation';
const FEATURE_ACCESS_POLLING_INTERVAL = 1000; // 1 seconds
const FEATURE_ACCESS_POLLING_TIMEOUT = 10000; // 10 seconds
const QR_DEEPLINK_POLLING_INTERVAL = 5000; // 5 seconds
const APPSFLYER_BASE_URL = 'https://ro.blox.com/Ebh5';

function FAEPersonaFlow({
  translate,
  onHidecallback,
  ageEstimation,
  featureSpecificParams
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
  ageEstimation: boolean;
  featureSpecificParams: TFeatureSpecificData;
}): React.ReactElement {
  // ===============================
  // Redux State & Dispatch
  // ===============================
  const dispatch = useAppDispatch();
  const IDVState = useSelector(selectIDVState);
  const loading = useSelector(selectLoading);
  const featureName = useSelector(selectFeatureName);
  const namespace = useSelector(selectNamespace);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const featureAccess = useSelector(selectFeatureAccess);
  const {
    vendorVerificationData,
    status: FAEStatus,
    error: verificationError,
    completionPageState
  } = IDVState;
  const { context = 'defaultContext' } = featureSpecificParams || {};
  const isParentVerification = featureSpecificParams?.source === 'parent';

  // ===============================
  // Refs & Derived State
  // ===============================
  const embeddedFlowPollingRef = useRef(false); // For embedded flow boolean flag
  const hostedFlowIntervalRef = useRef<NodeJS.Timeout | null>(null); // For hosted flow interval ID
  const hostedFlowTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For hosted flow timeout ID
  const featureAccessIntervalRef = useRef<NodeJS.Timeout | null>(null); // Feature access polling interval
  const featureAccessEndTimeRef = useRef<number>(0);
  const featureAccessPollingStartedRef = useRef(false);
  const endTime = useRef(Number(new Date()) + POLLING_TIMEOUT);
  const FAEStatusRef = useRef(FAEStatus);
  FAEStatusRef.current = FAEStatus; // Update ref to avoid stale closure
  const featureAccessRef = useRef(featureAccess);
  featureAccessRef.current = featureAccess;
  const personaClientRef = useRef<typeof Persona.Client.prototype | null>(null);
  const { sessionIdentifier, verificationLink } = vendorVerificationData;
  const theme = useTheme();
  const isWebview = (DeviceMeta && DeviceMeta().isInApp) ?? false;
  const flowType = isWebview ? FlowType.Hosted : FlowType.Embedded;

  // ===============================
  // Helper functions
  // ===============================

  // Clear hosted flow polling interval (used in multiple places)
  const clearHostedPolling = () => {
    if (hostedFlowIntervalRef.current) {
      clearInterval(hostedFlowIntervalRef.current);
      hostedFlowIntervalRef.current = null;
    }
  };

  // Clear feature access polling interval
  const clearFeatureAccessPolling = () => {
    if (featureAccessIntervalRef.current) {
      clearInterval(featureAccessIntervalRef.current);
      featureAccessIntervalRef.current = null;
    }
  };

  // Check if status is terminal (for embedded flow)
  function checkIsTerminalStatus(status: VerificationStatus | null) {
    if (!status) return false;
    return (
      status.sessionStatus === VerificationStatusCode.Stored ||
      status.sessionStatus === VerificationStatusCode.RequiresRetry ||
      status.sessionStatus === VerificationStatusCode.Failure
    );
  }

  // Handle terminal status and cleanup
  function terminationCleanup() {
    clearHostedPolling();
    clearFeatureAccessPolling();
    dispatch(resetVerificationStore());
    clearTimeout(hostedFlowTimeoutRef.current);
  }
  // Hide the modal and cleanup
  function onHide() {
    terminationCleanup();
    onHidecallback();
  }
  // Handle terminal status and cleanup
  function handleTerminalStatus() {
    if (featureAccessPollingStartedRef.current) return;
    featureAccessPollingStartedRef.current = true;
    featureAccessEndTimeRef.current = Number(new Date()) + FEATURE_ACCESS_POLLING_TIMEOUT;
    dispatch(setLoading(true));

    sendFAEMessageShownEvent(
      context,
      sessionIdentifier,
      FAEEventConstants.field.webFaeStatus,
      VerificationStatusCode[FAEStatus.sessionStatus]
    );

    const doFetch = () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(
        fetchFeatureAccess({
          featureName,
          ampFeatureCheckData,
          namespace,
          successfulAction: FAERecourse
        })
      );
    };

    // Initial fetch immediately
    doFetch();

    // Start polling until access is no longer actionable or timeout
    const intervalId = setInterval(() => {
      const { current } = featureAccessRef;
      const isActionable = current?.data?.access === Access.Actionable;
      const faeInRecourse = current?.data?.recourses?.find(
        recourse => recourse.action === FAERecourse
      );

      const timedOut = Number(new Date()) >= featureAccessEndTimeRef.current;
      if (!faeInRecourse) {
        clearInterval(intervalId);
        featureAccessIntervalRef.current = null;
        dispatch(setLoading(false));
        terminationCleanup();
      } else if (!isActionable || timedOut) {
        clearInterval(intervalId);
        featureAccessIntervalRef.current = null;
        dispatch(setLoading(false));
        onHide();
      } else {
        doFetch();
      }
    }, FEATURE_ACCESS_POLLING_INTERVAL);

    featureAccessIntervalRef.current = intervalId;
  }

  // Initialize FAE flow by calling Roblox age verification API
  function initializeFAE() {
    dispatch(setLoading(true));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(startIDVerification({ ageEstimation, parentVerification: isParentVerification }));
    if (flowType === FlowType.Embedded) {
      Persona.Client.preload().catch(error => {
        console.error('Failed to preload Persona client:', error);
      });
    }
    if (flowType === FlowType.Hosted) {
      endTime.current = Number(new Date()) + POLLING_TIMEOUT;
    }
  }

  // start FAE hosted flow
  function startFAEHostedFlow() {
    const intervalId = setInterval(() => {
      if (Number(new Date()) < endTime.current) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
      } else {
        clearInterval(intervalId);
        onHidecallback(); // Notify parent that verification timed out
      }
    }, POLLING_INTERVAL);
    // Store interval ID for cleanup
    hostedFlowIntervalRef.current = intervalId;

    if (vendorVerificationData.verificationLink) {
      sendFAEPageLoadEvent(context, sessionIdentifier, FAEEventConstants.field.webHostedFaeStart);
      openVerificationLink(vendorVerificationData.verificationLink, theme || DEFAULT_THEME);
    }
  }

  // start FAE embedded flow
  function startFAEEmbeddedFlow() {
    // Get user locale for Persona
    const userLocale = new Intl().getLocale();

    personaClientRef.current = new Persona.Client({
      inquiryId: sessionIdentifier,
      styleVariant: theme || DEFAULT_THEME,
      ...(userLocale && { language: userLocale }),
      onReady: () => {
        personaClientRef.current?.open();
        // report FAE modal open event with session identifier
        sendFAEModalShownEvent(
          context,
          sessionIdentifier,
          FAEEventConstants.field.webEmbededFaeStart
        );
        dispatch(setLoading(false));
      },
      onComplete: ({ inquiryId, status, fields }) => {
        if (embeddedFlowPollingRef.current) return; // prevent multiple polling loops
        dispatch(setLoading(true));
        embeddedFlowPollingRef.current = true;
        const intervalId = setInterval(() => {
          // Use ref to get current status since it cannot be accessed directly in closure.
          const { current: currentStatus } = FAEStatusRef;
          const isTerminal = checkIsTerminalStatus(currentStatus);

          if (!isTerminal) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            dispatch(fetchIDVerificationStatus(sessionIdentifier));
          } else {
            clearInterval(intervalId);
          }
        }, EMBEDDED_FLOW_POLLING_INTERVAL);

        hostedFlowTimeoutRef.current = setTimeout(() => {
          clearInterval(intervalId);
          dispatch(resetVerificationStore());
          onHide(); // Timeout = Denied access
        }, EMBEDDED_FLOW_POLLING_TIMEOUT);
      },
      onCancel: ({ inquiryId, sessionToken }) => {
        // report cancel
        sendFAEButtonClickEvent(
          context,
          inquiryId,
          FAEEventConstants.btn.cancelFae,
          FAEEventConstants.field.webEmbededFaeCancel
        );
        onHide();
      },
      onError: error => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
        sendFAEFormInteractionEvent(
          context,
          sessionIdentifier,
          FAEEventConstants.field.webEmbededFaeError
        );
        console.error(error);
      }
    });
  }

  // ===========================================
  // Effects to control 3 stages of the FAE flow
  // ===========================================

  // Stage 1: initialize FAE flow calling Roblox age verification api
  useEffect(() => {
    initializeFAE();
    // Cleanup on component unmount
    return () => {
      terminationCleanup();
      clearHostedPolling();
      if (personaClientRef.current) {
        personaClientRef.current.destroy();
        personaClientRef.current = null;
      }
    };
  }, []);

  // Stage 2: start vendor flow after receiving session identifier.
  // and start polling for FAE status from Roblox age verification api.
  useEffect(() => {
    if (flowType === FlowType.Embedded && sessionIdentifier) {
      startFAEEmbeddedFlow();
    } else if (flowType === FlowType.Hosted && sessionIdentifier && verificationLink != null) {
      startFAEHostedFlow();
    }
  }, [sessionIdentifier, verificationLink]);

  // Stage 3: handle terminal status when fail or success
  useEffect(() => {
    if (checkIsTerminalStatus(FAEStatus)) {
      handleTerminalStatus();
    }
  }, [FAEStatus]);

  // Close loading modal as soon as access is no longer actionable
  useEffect(() => {
    if (!featureAccessPollingStartedRef.current) return;
    if (featureAccess?.loading) return;
    const latestAccess = featureAccess?.data?.access;
    if (featureAccessIntervalRef.current && latestAccess && latestAccess !== Access.Actionable) {
      clearFeatureAccessPolling();
      dispatch(setLoading(false));
      onHide();
    }
  }, [featureAccess]);

  // ===============================
  // Component Render
  // ===============================

  // Get FAE component (only shows loading, no success/error pages)
  function getFAEComponent() {
    // Cooldown: startIDVerification returned daysUntilNextVerification > 0, so no
    // Persona session is created. Surface the temp-ban page instead of spinning forever.
    if (vendorVerificationData.daysUntilNextVerification > 0 && completionPageState) {
      return <VerificationCompletePage translate={translate} onHide={onHide} />;
    }

    // Show error page if verification failed to start (only when not loading)
    if (verificationError && !loading) {
      return <VerificationCompletePage translate={translate} onHide={onHide} />;
    }

    if (loading) {
      return <LoadingPage />;
    }
    return null;
  }

  // FAE page will only show loading page. No success or error page.
  return <React.Fragment>{getFAEComponent()}</React.Fragment>;
}

function FAEContainer({
  translate,
  onHidecallback,
  ageEstimation,
  featureSpecificParams
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
  ageEstimation: boolean;
  featureSpecificParams: TFeatureSpecificData;
}): React.ReactElement {
  const dispatch = useAppDispatch();
  const isWebview = (DeviceMeta && DeviceMeta().isInApp) ?? false;
  const featureName = useSelector(selectFeatureName);
  const namespace = useSelector(selectNamespace);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const featureAccess = useSelector(selectFeatureAccess);
  const ixpValues = useExperiments(faeQrCodeExperimentLayer);
  const isExperimentLoaded = ixpValues !== null;
  // TODO: remove FAE QR code experiemnt code since the new ixp is controled via guac.
  const isFaeQrCodeEnabled = Boolean(ixpValues?.isFaeQrCodeEnabled);
  const isFromAccountInfo = featureSpecificParams?.source === 'accountInfo';

  const showQrCodeFlow = !isWebview && isFaeQrCodeEnabled && isFromAccountInfo;
  const [appsFlyerLink, setAppsFlyerLink] = useState<string | null>(null);

  const { context = 'defaultContext' } = featureSpecificParams || {};

  // Read latest featureAccess inside the polling closure without resubscribing.
  const featureAccessRef = useRef(featureAccess);
  featureAccessRef.current = featureAccess;
  const deeplinkPollingRef = useRef<NodeJS.Timeout | null>(null);
  const deeplinkPollingEndTime = useRef<number>(0);

  const clearDeeplinkPolling = () => {
    if (deeplinkPollingRef.current) {
      clearInterval(deeplinkPollingRef.current);
      deeplinkPollingRef.current = null;
    }
  };

  useEffect(() => {
    async function checkDeeplinkPolicy() {
      if (featureSpecificParams?.source === 'parent') return;

      try {
        const policy = await Guac.callBehaviour<TAmpWizardPolicy>('amp-wizard');
        const deviceMeta = DeviceMeta?.();
        const isMobile = deviceMeta && (deviceMeta.isPhone || deviceMeta.isTablet);
        const isDesktopOrConsole = deviceMeta && (deviceMeta.isDesktop || deviceMeta.isConsole);
        const isAmazon = deviceMeta?.isAmazonApp ?? false;

        if (isMobile && !isAmazon && policy?.faeMobileWebDeeplinkEnabled) {
          const namespaceParam = namespace ? `&namespace=${namespace}` : '';
          const deepLink = `roblox://navigation/amp_wizard?feature_name=${featureName}${namespaceParam}&entry_point=web`;
          await DeepLinkService.navigateToDeepLink(deepLink);
          window.dispatchEvent(new Event(ModalEvent.ShowDownloadAppModal));
          onHidecallback();
          return;
        }

        if ((isDesktopOrConsole || isAmazon) && policy?.faeDesktopDeeplinkEnabled) {
          const deepLinkParams = new URLSearchParams({
            feature_name: featureName,
            entry_point: 'web',
            user_id: String(CurrentUser.userId)
          });
          if (namespace) {
            deepLinkParams.set('namespace', namespace);
          }
          const deepLink = `roblox://navigation/amp_wizard?${deepLinkParams.toString()}`;

          const oneLinkParams = new URLSearchParams({
            pid: 'QR_code',
            c: 'fae_onelink',
            is_retargeting: 'false',
            af_dp: deepLink,
            deep_link_value: deepLink
          });
          setAppsFlyerLink(`${APPSFLYER_BASE_URL}?${oneLinkParams.toString()}`);
        }
      } catch {
        // Guac fetch failed — fall through to normal flow
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    checkDeeplinkPolicy();
  }, []);

  useEffect(() => {
    if (isExperimentLoaded && ExperimentationService?.logLayerExposure) {
      ExperimentationService.logLayerExposure(faeQrCodeExperimentLayer);
    }
  }, [isExperimentLoaded]);

  // While the desktop deeplink QR is shown, poll feature access so the modal
  // auto-closes once the user finishes FAE on the device they scanned with.
  // Fire start here: QRDeepLinkDialog mounts already open, so onOpenChange(true)
  // never runs (Foundation only calls it on dismiss).
  useEffect(() => {
    if (!appsFlyerLink || deeplinkPollingRef.current) {
      return undefined;
    }

    sendFAEPageLoadEvent(context, '', FAEEventConstants.field.webQrCodeFaeStart);
    deeplinkPollingEndTime.current = Date.now() + POLLING_TIMEOUT;

    const doFetch = () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(
        fetchFeatureAccess({
          featureName,
          ampFeatureCheckData,
          namespace,
          successfulAction: FAERecourse
        })
      );
    };

    doFetch();

    deeplinkPollingRef.current = setInterval(() => {
      if (Date.now() >= deeplinkPollingEndTime.current) {
        clearDeeplinkPolling();
        sendFAEPageLoadEvent(context, '', FAEEventConstants.field.webQrCodeFaeTimeout);
        onHidecallback();
        return;
      }

      const { current } = featureAccessRef;
      const isActionable = current?.data?.access === Access.Actionable;
      const faeInRecourse = current?.data?.recourses?.find(
        recourse => recourse.action === FAERecourse
      );

      if (!faeInRecourse || !isActionable) {
        clearDeeplinkPolling();
        sendFAEPageLoadEvent(context, '', FAEEventConstants.field.webQrCodeFaeComplete);
        onHidecallback();
      } else {
        doFetch();
      }
    }, QR_DEEPLINK_POLLING_INTERVAL);

    return () => clearDeeplinkPolling();
  }, [appsFlyerLink]);

  if (appsFlyerLink) {
    return (
      <QRDeepLinkDialog
        open
        onOpenChange={isOpen => {
          if (!isOpen) {
            clearDeeplinkPolling();
            sendFAEPageLoadEvent(context, '', FAEEventConstants.field.webQrCodeFaeClose);
            onHidecallback();
          }
        }}
        deeplink={appsFlyerLink}
        title={
          translate(HeadingConstants.CheckAgeOnMobileApp) ||
          "Let's check your age on the mobile app"
        }
        description={
          translate(LabelConstants.ScanQRCodeToAgeCheck) ||
          'Scan this QR code with your phone or tablet camera to complete an age check'
        }
        footer={
          translate(LabelConstants.DownloadAppFallback) ||
          'Download the Roblox app on your mobile device and go to Settings > Account Info'
        }
        closeAffordance={translate('Action.Close') || 'Close'}
      />
    );
  }

  if (!isExperimentLoaded) {
    return <LoadingPage />;
  }

  if (showQrCodeFlow) {
    return (
      <FAEQRCodeContainer
        translate={translate}
        onHidecallback={onHidecallback}
        featureSpecificParams={featureSpecificParams}
      />
    );
  }

  return (
    <FAEPersonaFlow
      translate={translate}
      onHidecallback={onHidecallback}
      ageEstimation={ageEstimation}
      featureSpecificParams={featureSpecificParams}
    />
  );
}

export default FAEContainer;
