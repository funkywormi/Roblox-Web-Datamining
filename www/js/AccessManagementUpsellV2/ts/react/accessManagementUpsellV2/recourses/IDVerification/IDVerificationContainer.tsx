import Persona from 'persona';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTheme, TranslateFunction } from 'react-utilities';
import { DeviceMeta, Intl, TFeatureSpecificData } from 'Roblox';
import openVerificationLink from '../../utils/verificationUtils';
import {
  fetchFeatureAccess,
  selectAmpFeatureCheckData,
  selectFeatureAccess,
  selectFeatureName,
  selectNamespace
} from '../../accessManagement/accessManagementSlice';
import LoadingPage from '../../accessManagement/components/LoadingPage';
import { Access, IDVPage, PersonaTemplate, VerificationStatusCode } from '../../enums';
import { useAppDispatch } from '../../store';
import VerificationCompletePage from './components/VerificationCompletePage';
import ChecklistPage from './components/ChecklistPage';
import {
  fetchIDVerificationStatus,
  resetVerificationStore,
  selectIDVState,
  selectLoading,
  setLoading,
  startIDVerification
} from './verificationSlice';

const DEFAULT_THEME = 'dark';
const EMBEDDED_FLOW_POLLING_INTERVAL = 5000; // 5 seconds
const EMBEDDED_FLOW_POLLING_TIMEOUT = 30000; // 30 seconds
const POLLING_INTERVAL = 10000; // 10 seconds (hosted watchdog)
const POLLING_TIMEOUT = 1800000; // 30 minutes

function IDVerification({
  translate,
  onHidecallback,
  ageEstimation,
  template,
  featureSpecificParams
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
  ageEstimation: boolean;
  template?: PersonaTemplate;
  featureSpecificParams?: TFeatureSpecificData;
}): React.ReactElement {
  const endTime = useRef(Number(new Date()) + POLLING_TIMEOUT);
  const isParentVerification = featureSpecificParams?.source === 'parent';

  const dispatch = useAppDispatch();
  const IDVState = useSelector(selectIDVState);
  const loading = useSelector(selectLoading);
  const featureName = useSelector(selectFeatureName);
  const namespace = useSelector(selectNamespace);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const featureAccess = useSelector(selectFeatureAccess);
  const { page } = useSelector(selectIDVState);
  const pageRef = useRef(page);
  const embeddedFlowPollingRef = useRef(false);
  const hostedOpenedRef = useRef(false);
  const hostedFlowTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For hosted flow timeout ID
  const autoHiddenRef = useRef(false);
  const personaClientRef = useRef<typeof Persona.Client.prototype | null>(null);
  const isWebview = (DeviceMeta && DeviceMeta().isInApp) ?? false;

  const { vendorVerificationData, error: verificationError, status: idvStatus } = IDVState;
  const { sessionIdentifier, sessionToken, verificationLink } = vendorVerificationData;

  // The appeals flow renders its own follow-up (appeal) modal, so it skips the
  // wizard's built-in "Verification Successful" screen: on a successful IDV we
  // show a brief loader (below) and auto-close the wizard once access is granted.
  const isAppealsFlow = template === PersonaTemplate.IdvAppeal;
  const idvSucceeded =
    idvStatus?.sessionStatus === VerificationStatusCode.Success ||
    idvStatus?.sessionStatus === VerificationStatusCode.Stored;

  const theme = useTheme();

  // ===============================
  // Initialize flow
  // ===============================
  useEffect(() => {
    dispatch(setLoading(true));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(
      startIDVerification({ ageEstimation, parentVerification: isParentVerification, template })
    );
    if (isWebview) {
      endTime.current = Number(new Date()) + POLLING_TIMEOUT;
    }
    return () => {
      if (hostedFlowTimeoutRef.current) {
        clearTimeout(hostedFlowTimeoutRef.current);
      }
      if (personaClientRef.current) {
        personaClientRef.current.destroy();
        personaClientRef.current = null;
      }
    };
  }, []);

  function onHide() {
    dispatch(resetVerificationStore());
    clearTimeout(hostedFlowTimeoutRef.current);
    onHidecallback();
  }

  // ===============================
  // Hosted flow (webview)
  // ===============================
  let IDVComponent = null;
  if (isWebview || page === IDVPage.Complete) {
    switch (page) {
      case IDVPage.VendorLink:
        IDVComponent = <LoadingPage />;
        break;
      case IDVPage.Checklist:
        IDVComponent = <ChecklistPage translate={translate} onHide={onHide} />;
        break;
      case IDVPage.Complete:
        // For appeals we suppress the "Verification Successful" screen and show a
        // loader while the wizard tears itself down (see the auto-close effect
        // below). Failure / retry / manual-review states still render the
        // completion page so the user learns why IDV did not pass.
        IDVComponent =
          isAppealsFlow && idvSucceeded ? (
            <LoadingPage />
          ) : (
            <VerificationCompletePage translate={translate} onHide={onHide} />
          );
        break;
      default:
        IDVComponent = <LoadingPage />;
        break;
    }
  }

  useEffect(() => {
    if (!isWebview) return;
    if (sessionIdentifier && verificationLink != null && !hostedOpenedRef.current) {
      hostedOpenedRef.current = true;
      openVerificationLink(verificationLink);
    }
  }, [isWebview, sessionIdentifier, verificationLink]);

  useEffect(() => {
    if (
      isWebview &&
      !IDVState.loading &&
      vendorVerificationData.verificationLink != null &&
      IDVState.page !== IDVPage.Complete &&
      Number(new Date()) < endTime.current
    ) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
      }, POLLING_INTERVAL);
    }
  }, [IDVState]);

  useEffect(() => {
    if (page === IDVPage.Complete) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(fetchFeatureAccess({ featureName, ampFeatureCheckData, namespace }));
    }
  }, [page]);

  // Appeals skips the wizard's success screen: as soon as the post-IDV access
  // check grants access, tear the whole wizard down (resetting both the IDV and
  // access-management stores) so the caller's promise resolves and it can open
  // the appeal modal — with no success screen left behind to stack on top of.
  useEffect(() => {
    if (
      isAppealsFlow &&
      page === IDVPage.Complete &&
      featureAccess?.data?.access === Access.Granted &&
      !autoHiddenRef.current
    ) {
      autoHiddenRef.current = true;
      onHide();
    }
  }, [isAppealsFlow, page, featureAccess]);

  // ===============================
  // Embedded flow (web)
  // ===============================
  useEffect(() => {
    if (!isWebview && sessionIdentifier) {
      // Get user locale for Persona
      const userLocale = new Intl().getLocale();

      personaClientRef.current = new Persona.Client({
        inquiryId: sessionIdentifier,
        styleVariant: theme || DEFAULT_THEME,
        ...(userLocale && { language: userLocale }),
        // Relay the session token when resuming a pending inquiry so Persona
        // reopens the in-progress session instead of starting a new one.
        ...(sessionToken && { sessionToken }),
        onReady: () => {
          personaClientRef.current?.open();
          dispatch(setLoading(false));
        },
        onComplete: ({ inquiryId, status, fields }) => {
          if (embeddedFlowPollingRef.current) return; // prevent multiple polling loops
          dispatch(setLoading(true));
          embeddedFlowPollingRef.current = true;
          const intervalId = setInterval(() => {
            if (pageRef.current !== IDVPage.Complete) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              dispatch(fetchIDVerificationStatus(sessionIdentifier));
            }
          }, EMBEDDED_FLOW_POLLING_INTERVAL);
          hostedFlowTimeoutRef.current = setTimeout(() => {
            clearInterval(intervalId);
            dispatch(setLoading(false));
          }, EMBEDDED_FLOW_POLLING_TIMEOUT);
        },
        onCancel: () => {
          onHide();
        },
        onError: error => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
          console.error(error);
        }
      });
    }
  }, [sessionIdentifier]);

  if (verificationError && !loading) {
    return <VerificationCompletePage translate={translate} onHide={onHide} />;
  }

  // IDVPage.Complete will be shown for both webview/non-webview to show completion/error state after IDV flow.
  // Loading is only for embedded flow to show loader when embedded flow component is loading as well as transitioning post IDV completion.
  // All other IDVComponent will be only shown for hosted flow since it's explaining which step of IDV the user is on in the hosted flow.
  // TODO: clean up the screens so that completion page is pulled out of the group of other IDV status pages that are only required for hosted flow.
  return (
    <React.Fragment>
      {isWebview || page === IDVPage.Complete ? IDVComponent : loading && <LoadingPage />}
    </React.Fragment>
  );
}

export default IDVerification;
