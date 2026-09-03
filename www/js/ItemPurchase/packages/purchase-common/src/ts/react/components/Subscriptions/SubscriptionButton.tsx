import React, { useCallback, useMemo, useState } from 'react';
import { upsellUtil } from '@rbx/core-scripts/legacy/core-roblox-utilities';
import { DeviceMeta } from '@rbx/legacy-webapp-types/Roblox';
import { Button } from '@rbx/foundation-ui';

type SubscriptionButtonProps = {
  productType: string;
  productId: string;
  deviceMeta: ReturnType<typeof DeviceMeta>;
  isDisabled?: boolean;
  children: React.ReactNode;
  upsellUuid?: string;
  paymentSessionId?: string;
  redirectUrl?: string;
  trackSubscriptionButtonClick?: () => void;
};

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  productType,
  productId,
  deviceMeta,
  isDisabled = false,
  children,
  upsellUuid,
  paymentSessionId,
  redirectUrl,
  trackSubscriptionButtonClick
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = useCallback(() => {
    if (!isDisabled) {
      trackSubscriptionButtonClick?.();
      setIsLoading(true);
    }
  }, [isDisabled, trackSubscriptionButtonClick]);

  const purchaseUrl = useMemo(() => {
    if (deviceMeta.isDesktop) {
      const url = new URL('/upgrades/paymentmethods', window.location.origin);
      url.searchParams.append('ctx', 'subscription');
      url.searchParams.append('type', productType);
      url.searchParams.append('id', productId);
      if (redirectUrl) {
        url.searchParams.append('returnUrl', redirectUrl);
      }
      if (upsellUuid) {
        url.searchParams.append(upsellUtil.constants.UPSELL_QUERY_PARAM_KEY, upsellUuid);
      }
      if (paymentSessionId) {
        url.searchParams.append('paymentSessionId', paymentSessionId);
      }
      return url.toString();
    }

    if (deviceMeta.isAndroidApp || deviceMeta.isIosApp) {
      const url = new URL('/mobile-app-upgrades/buy', window.location.origin);
      url.searchParams.append('ctx', 'subscription');
      url.searchParams.append('type', productType);
      url.searchParams.append('id', productId);
      return url.toString();
    }

    return undefined;
  }, [
    deviceMeta.isDesktop,
    deviceMeta.isAndroidApp,
    deviceMeta.isIosApp,
    productType,
    productId,
    upsellUuid,
    paymentSessionId,
    redirectUrl
  ]);

  return (
    <Button
      as='a'
      href={purchaseUrl}
      isDisabled={isDisabled || !purchaseUrl}
      isLoading={isLoading}
      variant='Emphasis'
      onClick={onClick}>
      {children}
    </Button>
  );
};

export default SubscriptionButton;
