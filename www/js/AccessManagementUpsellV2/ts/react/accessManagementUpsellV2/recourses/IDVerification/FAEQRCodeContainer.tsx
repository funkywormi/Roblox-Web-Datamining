// deprecated since a new common component is used for QR code generation
import { toDataURL } from 'qrcode';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { TranslateFunction } from 'react-utilities';
import { TFeatureSpecificData } from 'Roblox';
import {
  fetchFeatureAccess,
  selectAmpFeatureCheckData,
  selectFeatureAccess,
  selectFeatureName,
  selectNamespace
} from '../../accessManagement/accessManagementSlice';
import LoadingPage from '../../accessManagement/components/LoadingPage';
import { Access } from '../../enums';
import { useAppDispatch } from '../../store';
import FAEEventConstants from './constants/eventConstants';
import { sendFAEPageLoadEvent } from './services/FaeEventService';
import FAEQRCodePage from './components/FAEQRCodePage';

const QR_CODE_URL = 'https://ro.blox.com/Ebh5/fae';
const POLLING_INTERVAL = 5000; // 5 seconds
const POLLING_TIMEOUT = 1800000; // 30 minutes
const FAERecourse = 'AgeEstimation';

function FAEQRCodeContainer({
  translate,
  onHidecallback,
  featureSpecificParams
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
  featureSpecificParams: TFeatureSpecificData;
}): React.ReactElement {
  const dispatch = useAppDispatch();
  const featureName = useSelector(selectFeatureName);
  const namespace = useSelector(selectNamespace);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const featureAccess = useSelector(selectFeatureAccess);
  const featureAccessRef = useRef(featureAccess);
  featureAccessRef.current = featureAccess;

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingEndTime = useRef(Date.now() + POLLING_TIMEOUT);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const { context = 'defaultContext' } = featureSpecificParams || {};

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    async function generateQRCode() {
      try {
        const dataUrl = await toDataURL(QR_CODE_URL, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 268
        });
        setQrDataUrl(dataUrl);

        sendFAEPageLoadEvent(context, '', FAEEventConstants.field.webQrCodeFaeStart);
      } catch (e) {
        console.error('Failed to generate FAE QR code:', e);
        setError(true);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    generateQRCode();

    return () => {
      clearPolling();
    };
  }, []);

  useEffect(() => {
    if (!qrDataUrl || pollingIntervalRef.current) return;

    pollingEndTime.current = Date.now() + POLLING_TIMEOUT;

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

    pollingIntervalRef.current = setInterval(() => {
      if (Date.now() >= pollingEndTime.current) {
        clearPolling();
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
        clearPolling();
        sendFAEPageLoadEvent(context, '', FAEEventConstants.field.webQrCodeFaeComplete);
        onHidecallback();
      } else {
        doFetch();
      }
    }, POLLING_INTERVAL);
  }, [qrDataUrl]);

  useEffect(() => {
    if (error) {
      onHidecallback();
    }
  }, [error]);

  if (error) {
    return null;
  }

  if (!qrDataUrl) {
    return <LoadingPage />;
  }

  const handleUserClose = () => {
    clearPolling();
    sendFAEPageLoadEvent(context, '', FAEEventConstants.field.webQrCodeFaeClose);
    onHidecallback();
  };

  return <FAEQRCodePage qrDataUrl={qrDataUrl} translate={translate} onHide={handleUserClose} />;
}

export default FAEQRCodeContainer;
