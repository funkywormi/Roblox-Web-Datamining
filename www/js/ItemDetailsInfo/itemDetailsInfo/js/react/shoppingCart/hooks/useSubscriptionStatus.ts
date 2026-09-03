import { useState, useEffect } from 'react';
import { TSubscriptionStatus } from '../constants/types';
import { fetchSubscriptionStatus } from '../services/subscriptionService';

const defaultStatus: TSubscriptionStatus = {
  hasSubscription: false,
  hasFreeTrial: false,
  discountPercentage: 0,
  priceDisplayString: ''
};

export default function useSubscriptionStatus(): {
  subscriptionStatus: TSubscriptionStatus;
  isLoading: boolean;
} {
  const [subscriptionStatus, setSubscriptionStatus] = useState<TSubscriptionStatus>(defaultStatus);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus()
      .then(status => {
        setSubscriptionStatus(status);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  return { subscriptionStatus, isLoading };
}
