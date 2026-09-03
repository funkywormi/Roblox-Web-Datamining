import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { fireEvent } from 'roblox-event-tracker';
import { authenticatedUser } from 'header-scripts';
import { httpResponseCodes } from 'core-utilities';
import { useHistory } from 'react-router-dom';
import {
  PeriodType as ApiPeriodType,
  ProductType,
  RobloxSubscriptionProductFeatureConfig
} from '@rbx/client-subscriptions-api/v1';
import { PremiumPurchasePlatform } from '../../../core/types/premiumEnums';
import {
  CreditBalance,
  ErrorResponse,
  SubscriptionMetadata
} from '../../../core/types/serviceTypes';
import {
  getSubscriptionMetadata,
  getUserCreditBalance,
  getUserPremiumSubscription,
  getUserSubscriptions,
  listSubscriptionsV2,
  getFaeTrialProductId
} from '../../../core/services/subscriptionServices';
import { mapV2ToUserSubscription, toTargetKey } from '../utils/mappers';
import {
  PaymentProvider,
  PollingStatus,
  SubscriptionListItemType
} from '../../../core/types/subscriptionEnums';
import { SubscriptionListItem, UserSubscription } from '../../../core/types/userSubscription';
import { PremiumSubscription } from '../../../core/types/premiumSubscription';
import SubscriptionsList from '../components/SubscriptionsList';
import SubscriptionDetails from '../components/SubscriptionDetails';
import { RESULTS_PER_PAGE, SUBSCRIPTIONS_HELP_LINK } from '../constants/constants';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import { COUNTER_METRICS } from '../constants/metricConstants';
import trackerClient, { ManageEventType } from '../utils/logging';
import {
  getSavedPaymentProfiles,
  isStripeEnabledForUser
} from '../../../core/services/paymentServices';
import { SavedPaymentProfile } from '../../../core/types/savedPaymentProfile';
import StripeElementsContainer from '../../shared/components/StripeElementsContainer';
import UpdatePaymentProfileModal from '../components/UpdatePaymentProfileModal';
import { getUserBirthdate } from '../../../core/services/usersServices';
import { isUnder18 } from '../../../core/utils/userUtils';
import { getPaymentProfile, isExpiring } from '../utils/subscriptionUtils';
import { MyPrivateServerType } from '../../../core/types/privateServerTypes';
import PrivateServerDetails from '../components/PrivateServerDetails';
import { getAllPrivateServers } from '../../../core/services/privateServerServices';

const ManagementContainer: React.FC = () => {
  const [premiumSubscription, setPremiumSubscription] = useState<PremiumSubscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [privateServers, setPrivateServers] = useState<MyPrivateServerType[]>([]);
  const [combinedList, setCombinedList] = useState<SubscriptionListItem[]>([]);
  // Roblox Plus (Blackbird) product info, used to render the dynamic benefit list
  // on the details page. Fetched once we know the user has a Blackbird subscription.
  const [blackbirdProductInfo, setBlackbirdProductInfo] = useState<{
    featureConfig: RobloxSubscriptionProductFeatureConfig;
    periodType: ApiPeriodType;
  } | null>(null);
  const [isFaeFreeTrial, setIsFaeFreeTrial] = useState(false);
  const [creditBalance, setCreditBalance] = useState<CreditBalance>({
    creditBalance: 0,
    currencyCode: ''
  });
  const [activeSubsPage, setActiveSubsPage] = useState(1);
  const [subscriptionMetadata, setSubscriptionMetadata] = useState<SubscriptionMetadata>({
    isWebPurchasingEnabled: false,
    isSubscriptionPaymentProfileUpdatingEnabled: false
  });

  const { translate } = useTranslation();

  // The current detailed subscription we are viewing, or null if not viewing one
  const [currentSubscriptionView, setCurrentSubscriptionView] = useState<
    UserSubscription | PremiumSubscription | null
  >(null);
  // Set when the user lands directly on a subscription's details via a
  // deep-link URL (e.g. ?id=...&type=Blackbird). Used so the back button can
  // pop the prior browser entry instead of falling back to the list view.
  const [wasDeepLinked, setWasDeepLinked] = useState(false);
  const [
    currentPrivateServerView,
    setCurrentPrivateServerView
  ] = useState<MyPrivateServerType | null>(null);
  const [currSubscriptionIsPremium, setCurrSubscriptionIsPremium] = useState(false);
  const [showLowBalanceNotificationForPremium, setShowLowBalanceNotificationForPremium] = useState(
    false
  );
  const [premiumPaymentProvider, setPremiumPaymentProvider] = useState<
    PaymentProvider | undefined
  >();
  const [premiumPaymentProfile, setPremiumPaymentProfile] = useState<
    SavedPaymentProfile | undefined
  >(undefined);
  const [paymentProfiles, setPaymentProfiles] = useState<SavedPaymentProfile[]>([]);
  const [isUserUnder18, setIsUserUnder18] = useState<boolean>(true);
  const [isUserVpcVerified, setIsUserVpcVerified] = useState<boolean>(false);
  const [canUserUseStripe, setCanUserUseStripe] = useState<boolean>(false);

  const [pollingTargetKey, setPollingTargetKey] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<PollingStatus | null>(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const closeUpdateModal = () => setShowUpdateModal(false);

  const openUpdateModal = (subscription: UserSubscription | PremiumSubscription) => {
    trackerClient.sendEvent(ManageEventType.CLICK_EDIT_PAYMENT_METHOD, subscription);
    setShowUpdateModal(true);
  };

  const history = useHistory();

  // System feedback banner to display
  const { SystemFeedback, systemFeedbackService } = useSystemFeedbackContext();

  const fetchSavedPaymentProfiles = async (): Promise<SavedPaymentProfile[]> => {
    try {
      fireEvent(COUNTER_METRICS.API.GET_SAVED_PAYMENT_PROFILES_CALLED);
      const response = await getSavedPaymentProfiles();
      if (response?.data?.length > 0) {
        setPaymentProfiles(response.data.slice());
        return response.data;
      }
      fireEvent(COUNTER_METRICS.API.GET_SAVED_PAYMENT_PROFILES_SUCCEEDED);
    } catch (e) {
      fireEvent(COUNTER_METRICS.API.GET_SAVED_PAYMENT_PROFILES_FAILED);
    }

    return [];
  };

  const updatePremiumSubscriptionView = useCallback(
    (subscription: PremiumSubscription) => {
      setPremiumSubscription(subscription);
      setCurrentSubscriptionView(subscription);
    },
    [setPremiumSubscription, setCurrentSubscriptionView]
  );

  // Send event on first page load
  useEffect(() => {
    trackerClient.sendEvent(ManageEventType.PAGE_LOAD);
  }, []);

  // Deep-link into a specific subscription on initial render.
  // Supports two URL formats:
  //   New:    ?id=<id>&type=<type>
  //   Legacy: #!/subscriptions?subscription=<subscriptionTargetKey>
  useEffect(() => {
    if (subscriptions.length === 0) {
      return;
    }

    // New format: ?id=<productId>&type=<productType>
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    if (id && type) {
      const targetKey = toTargetKey(type, id);
      if (targetKey) {
        const selectedSub = subscriptions.find(s => s.subscriptionTargetKey === targetKey);
        if (selectedSub) {
          setCurrentSubscriptionView(selectedSub);
          setWasDeepLinked(true);
          trackerClient.sendEvent(ManageEventType.EMAIL_REFERER_PAGE_LOAD, selectedSub);
        }
      }
      return;
    }

    // Legacy format: #!/subscriptions?subscription=<subscriptionTargetKey>.
    const { hash } = window.location;
    if (hash.startsWith('#!/subscriptions?subscription=')) {
      const sub = hash.substring('#!/subscriptions?subscription='.length);

      if (sub !== null && sub !== '') {
        if (sub.startsWith('PRM')) {
          setCurrSubscriptionIsPremium(true);
          setCurrentSubscriptionView(premiumSubscription);
          trackerClient.sendEvent(ManageEventType.EMAIL_REFERER_PAGE_LOAD);
        } else {
          const selectedSub = subscriptions.find(s => s.subscriptionTargetKey === sub);
          if (selectedSub) {
            setCurrentSubscriptionView(selectedSub);
            trackerClient.sendEvent(ManageEventType.EMAIL_REFERER_PAGE_LOAD, selectedSub);
          }
        }
      }
    }
  }, [currentSubscriptionView, premiumSubscription, subscriptions]);

  useEffect(() => {
    isStripeEnabledForUser()
      .then(response => {
        setCanUserUseStripe(response.data.isPaymentProviderEnabledForUser);
        setIsUserVpcVerified(response.data.isUserVpcApproved);
      })
      .catch(() => {
        setCanUserUseStripe(false);
        setIsUserVpcVerified(false);
      });

    fetchSavedPaymentProfiles().catch(() =>
      systemFeedbackService.warning('Failed to load payment profiles')
    );

    getUserBirthdate()
      .then(response => {
        setIsUserUnder18(
          isUnder18(response.data.birthDay, response.data.birthMonth, response.data.birthYear)
        );
      })
      .catch(() => {
        systemFeedbackService.warning('Something went wrong.');
      });

    getSubscriptionMetadata()
      .then(result => setSubscriptionMetadata(result))
      .catch(() =>
        setSubscriptionMetadata({
          isWebPurchasingEnabled: false,
          isSubscriptionPaymentProfileUpdatingEnabled: false
        })
      );
  }, [systemFeedbackService]);

  // Get premium subscription
  const loadPremium = () => {
    fireEvent(COUNTER_METRICS.API.GET_USER_PREMIUM_SUBSCRIPTION_CALLED);
    getUserPremiumSubscription(authenticatedUser.id!)
      .then(result => {
        if (result === null) {
          fireEvent(COUNTER_METRICS.SUBSCRIPTIONS.NO_EXISTING_SUBSCRIPTION);
        } else {
          fireEvent(COUNTER_METRICS.API.GET_USER_PREMIUM_SUBSCRIPTION_SUCCEEDED);
        }
        setPremiumSubscription(result);

        // If premium details changed, fetch the latest details,
        // and update the details page
        if (currSubscriptionIsPremium) {
          setCurrentSubscriptionView(result);
        }
      })
      .catch(() => {
        fireEvent(COUNTER_METRICS.API.GET_USER_PREMIUM_SUBSCRIPTION_FAILED);
        systemFeedbackService.warning(translate('MessageUnknownError'));
      });
  };

  useEffect(() => {
    if (premiumSubscription) {
      premiumSubscription.showLowBalanceNotification = showLowBalanceNotificationForPremium;
      if (premiumPaymentProvider !== undefined) {
        premiumSubscription.paymentProvider = premiumPaymentProvider;
      }
      premiumSubscription.cardInfo = {
        cardNetwork: premiumPaymentProfile?.providerPayload.CardNetwork ?? '',
        last4Digits: premiumPaymentProfile?.providerPayload.Last4Digits ?? '',
        expMonth: premiumPaymentProfile?.providerPayload.ExpMonth ?? 0,
        expYear: premiumPaymentProfile?.providerPayload.ExpYear ?? 0
      };
      premiumSubscription.paymentProfileId = premiumPaymentProfile?.id ?? '';
      if (
        premiumPaymentProfile?.providerPayload.CardNetwork &&
        premiumPaymentProfile?.providerPayload.Last4Digits &&
        premiumPaymentProfile?.providerPayload.ExpMonth &&
        premiumPaymentProfile?.providerPayload.ExpYear
      ) {
        // If there is a card info, it is a desktop purchase
        // Add field for front end card icon
        premiumSubscription.purchasePlatform = PremiumPurchasePlatform.DESKTOP;
      }
    }
  }, [
    showLowBalanceNotificationForPremium,
    premiumSubscription,
    premiumPaymentProvider,
    premiumPaymentProfile?.providerPayload.CardNetwork,
    premiumPaymentProfile?.providerPayload.Last4Digits,
    premiumPaymentProfile?.providerPayload.ExpMonth,
    premiumPaymentProfile?.providerPayload.ExpYear,
    premiumPaymentProfile?.id
  ]);

  useEffect(loadPremium, [currSubscriptionIsPremium, systemFeedbackService, translate]);

  useEffect(() => {
    // Get all subscriptions that have an expiration time after the current time
    // V1 for developer subscriptions
    const fetchV1Subscriptions = getUserSubscriptions(new Date()).then(results => {
      // Dev subs (EXP) always come from V1. RBP/CUR may also appear on V1; V2 is preferred when it returns
      // the same target key, but some products (e.g. internal billing) are only present on V1 — keep those.
      const devSubs = results.filter(sub => sub.subscriptionTargetKey.startsWith('EXP'));
      const v1RobloxOwnedSubs = results.filter(
        sub =>
          sub.subscriptionTargetKey.startsWith('RBP') || sub.subscriptionTargetKey.startsWith('CUR')
      );

      const premiumSubInfo = results.find(sub => sub.subscriptionTargetKey.startsWith('PRM'));

      if (premiumSubInfo) {
        setShowLowBalanceNotificationForPremium(premiumSubInfo.showLowBalanceNotification ?? false);
        setPremiumPaymentProvider(premiumSubInfo.paymentProvider);
        setPremiumPaymentProfile({
          id: premiumSubInfo.paymentProfileId,
          providerPayload: {
            CardNetwork: premiumSubInfo.cardInfo?.cardNetwork ?? '',
            Last4Digits: premiumSubInfo.cardInfo?.last4Digits ?? '',
            ExpMonth: premiumSubInfo.cardInfo?.expMonth ?? 0,
            ExpYear: premiumSubInfo.cardInfo?.expYear ?? 0
          }
        });
      }

      return { devSubs, v1RobloxOwnedSubs };
    });

    // V2 for Blackbird and Currency Subscription (two parallel calls since API accepts single productType)
    const fetchV2Subscriptions = Promise.all([
      listSubscriptionsV2(ProductType.Blackbird),
      listSubscriptionsV2(ProductType.CurrencySubscription)
    ]).then(([blackbirdSubs, currencySubs]) => {
      const blackbirdInfo = blackbirdSubs[0]?.productInfo;
      const featureConfig =
        blackbirdInfo?.productTypeDetails?.robloxSubscriptionProductDetails?.featureConfig;
      if (blackbirdInfo && featureConfig) {
        setBlackbirdProductInfo({ featureConfig, periodType: blackbirdInfo.periodType });
      }

      const activeBlackbirdProductId = blackbirdSubs[0]?.productKey?.id;
      if (activeBlackbirdProductId) {
        getFaeTrialProductId()
          .then(faeProductId => setIsFaeFreeTrial(faeProductId === activeBlackbirdProductId))
          .catch(() => setIsFaeFreeTrial(false));
      }

      return [
        ...blackbirdSubs.map(mapV2ToUserSubscription),
        ...currencySubs.map(mapV2ToUserSubscription)
      ];
    });

    // Combine: EXP from V1, Roblox-owned rows from V2, plus V1 RBP/CUR only when V2 did not return that key
    Promise.all([fetchV1Subscriptions, fetchV2Subscriptions])
      .then(([{ devSubs, v1RobloxOwnedSubs }, robloxSubs]) => {
        const v2Keys = new Set(robloxSubs.map(s => s.subscriptionTargetKey));
        const v1RobloxFallback = v1RobloxOwnedSubs.filter(
          sub => !v2Keys.has(sub.subscriptionTargetKey)
        );
        setSubscriptions([...devSubs, ...robloxSubs, ...v1RobloxFallback]);
      })
      .catch(() => {
        systemFeedbackService.warning(translate('MessageUnknownError'));
      });

    getAllPrivateServers()
      .then(privateServerResults => setPrivateServers(privateServerResults))
      .catch(() => systemFeedbackService.warning(translate('MessageUnknownError')));
  }, [systemFeedbackService, translate]);

  // combine and sort the subs and private servers
  useEffect(() => {
    // sorting fn for subs and private servers. sort by provider name then sub name
    const sortCompareFn = (subA: SubscriptionListItem, subB: SubscriptionListItem) => {
      // put fiat subs first
      if (
        subA.type === SubscriptionListItemType.SUBSCRIPTION &&
        subB.type === SubscriptionListItemType.PRIVATE_SERVER
      ) {
        return -1; // subA comes before subB
      }
      if (
        subA.type === SubscriptionListItemType.PRIVATE_SERVER &&
        subB.type === SubscriptionListItemType.SUBSCRIPTION
      ) {
        return 1; // subA comes after subB
      }
      const providerCompare = subA.providerName.localeCompare(subB.providerName);
      if (providerCompare !== 0) {
        return providerCompare;
      }
      return subA.name.localeCompare(subB.name);
    };
    const subscriptionItems = subscriptions.map(
      (subscription): SubscriptionListItem => {
        return {
          type: SubscriptionListItemType.SUBSCRIPTION,
          subscription,
          privateServer: null,
          name: subscription.name,
          providerName: subscription.subscriptionProviderName
        };
      }
    );
    const privateServerItems = privateServers.map(
      (privateServer): SubscriptionListItem => {
        return {
          type: SubscriptionListItemType.PRIVATE_SERVER,
          subscription: null,
          privateServer,
          name: privateServer.name,
          providerName: privateServer.universeName
        };
      }
    );
    setCombinedList([...subscriptionItems, ...privateServerItems].sort(sortCompareFn));
  }, [subscriptions, privateServers]);

  useEffect(() => {
    getUserCreditBalance()
      .then(result => {
        if (result != null) {
          setCreditBalance(result);
        }
      })
      .catch(e => {
        const errorResponse = e as ErrorResponse;
        if (errorResponse.status !== httpResponseCodes.notFound) {
          systemFeedbackService.warning(translate('MessageUnknownError'));
        }
      });
  }, [systemFeedbackService, translate]);

  // After a Roblox Plus status change (cancel or resubscribe), poll the backend
  // until the change is confirmed so that private server pricing updates
  // without a hard reload.
  useEffect(() => {
    if (!pollingStatus || !pollingTargetKey) return;

    const startTime = Date.now();
    const POLL_INTERVAL_MS = 500;
    const MAX_POLL_DURATION_MS = 10_000;
    let inFlight = false;

    const refreshAll = async () => {
      const [freshV1, [freshPlus, freshCurrency], freshPrivateServers] = await Promise.all([
        getUserSubscriptions(new Date()).then(r =>
          r.filter(s => s.subscriptionTargetKey.startsWith('EXP'))
        ),
        Promise.all([
          listSubscriptionsV2(ProductType.Blackbird),
          listSubscriptionsV2(ProductType.CurrencySubscription)
        ]),
        getAllPrivateServers()
      ]);
      setSubscriptions(
        [...[...freshV1, ...freshPlus.map(mapV2ToUserSubscription)], ...freshCurrency.map(mapV2ToUserSubscription)]
      );
      setPrivateServers(freshPrivateServers);
    };

    const stopPolling = async () => {
      await refreshAll().catch(() => undefined);
      setPollingStatus(null);
      setPollingTargetKey(null);
    };

    const intervalId = setInterval(async () => {
      if (inFlight) return;
      if (Date.now() - startTime >= MAX_POLL_DURATION_MS) {
        clearInterval(intervalId);
        await stopPolling();
        return;
      }

      inFlight = true;
      try {
        const plusSubs = await listSubscriptionsV2(ProductType.Blackbird);
        const mapped = plusSubs.map(mapV2ToUserSubscription);
        const target = mapped.find(s => s.subscriptionTargetKey === pollingTargetKey);
        if (!target) return;

        let isUpdated = false;
        switch (pollingStatus) {
          case PollingStatus.CANCEL:
            isUpdated = isExpiring(target.renewal, target.expiration);
            break;
          case PollingStatus.RESUBSCRIBE:
            isUpdated = !isExpiring(target.renewal, target.expiration);
            break;
          default:
            break;
        }

        if (isUpdated) {
          clearInterval(intervalId);
          await stopPolling();
        }
      } catch {
        // Swallow and keep polling
      } finally {
        inFlight = false;
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [pollingStatus, pollingTargetKey]);

  // onSelectSubscription ultimately is a dependency in a useMemo in SubscriptionsList
  // so needs to be memoized
  const onSelectSubscription = useCallback(
    (subscription: UserSubscription | PremiumSubscription, isPremium) => {
      setCurrentSubscriptionView(subscription);
      setCurrSubscriptionIsPremium(isPremium);

      // Send event
      if (!isPremium) {
        // Can cast as we know not premium
        trackerClient.sendEvent(ManageEventType.VIEW_ACTIVE, subscription as UserSubscription);
      }
    },
    []
  );
  const onSelectPrivateServer = useCallback((privateServer: MyPrivateServerType) => {
    setCurrentPrivateServerView(privateServer);
  }, []);

  const onDetailsBack = () => {
    // If the user landed directly on these details via a deep-link, pop the
    // prior browser entry so back returns them to wherever they came from
    // (e.g. an email or notification).
    if (wasDeepLinked) {
      setWasDeepLinked(false);
      window.history.back();
      return;
    }
    setCurrentSubscriptionView(null);
    setCurrentPrivateServerView(null);
    setCurrSubscriptionIsPremium(false);
    history.push('#!/subscriptions');
  };

  // Sending an async call to resubscribe/cancel a subscription takes time
  // and may not refresh the page, so we are optimistically updating the expiration
  // and renewal dates to reflect the new subscription state and notify the user of the change
  const onStatusChange = (isPremium: boolean, canceled: boolean, subscriptionTargetKey: string) => {
    // Case where the premium subscription is canceled
    if (isPremium && premiumSubscription && canceled) {
      // Create faux premium subscription that reflects the canceled state
      // Set expiration to renewal time and renewal to 0
      const premSubscription = {
        ...premiumSubscription,
        expiration: premiumSubscription.renewal,
        renewal: new Date(0)
      };
      setPremiumSubscription(premSubscription);

      if (currentSubscriptionView && currSubscriptionIsPremium) {
        const currUserSub = currentSubscriptionView as PremiumSubscription;
        if (currUserSub.subscriptionTargetKey === subscriptionTargetKey) {
          // Should always be true, can only cancel the currently viewed subscription
          setCurrentSubscriptionView(premSubscription);
        }
      }
    }

    // Case where the premium subscription is resubscribed
    if (isPremium && premiumSubscription && !canceled) {
      // Create faux premium subscription that reflects the resubscribed state
      // Set renewal to expiration time. Changing expiration is not necessary
      // as renewal time will be displayed if it is the same as expiration time
      const premSubscription = {
        ...premiumSubscription,
        renewal: premiumSubscription.expiration
      };
      setPremiumSubscription(premSubscription);

      if (currentSubscriptionView && currSubscriptionIsPremium) {
        const currUserSub = currentSubscriptionView as PremiumSubscription;
        if (currUserSub.subscriptionTargetKey === subscriptionTargetKey) {
          // Should always be true, can only cancel the currently viewed subscription
          setCurrentSubscriptionView(premSubscription);
        }
      }
    }

    const updatedSubscriptions = [...subscriptions];
    const subToUpdate = updatedSubscriptions.find(
      sub => sub.subscriptionTargetKey === subscriptionTargetKey
    ) as UserSubscription;

    // Case where a subscription is canceled
    if (!isPremium && canceled && subToUpdate) {
      // Create faux subscription that reflects the canceled state
      // Set expiration to renewal time and renewal to 0
      subToUpdate.expiration = subToUpdate.renewal;
      subToUpdate.renewal = new Date(0);
      setSubscriptions(updatedSubscriptions);

      if (subToUpdate.productType === ProductType.Blackbird) {
        // Redirect to main page and poll until the backend confirms cancellation
        // so that private server pricing updates without a hard reload.
        setCurrentSubscriptionView(null);
        history.push('#!/subscriptions');
        setPollingTargetKey(subscriptionTargetKey);
        setPollingStatus(PollingStatus.CANCEL);
      } else if (currentSubscriptionView && !currSubscriptionIsPremium) {
        const currUserSub = currentSubscriptionView as UserSubscription;
        if (currUserSub.subscriptionTargetKey === subscriptionTargetKey) {
          // Should always be true, can only cancel the currently viewed subscription
          setCurrentSubscriptionView(subToUpdate);
        }
      }
    }

    // Case where a subscription is resubscribed
    if (!isPremium && !canceled && subToUpdate) {
      // Create faux subscription that reflects the resubscribed state
      // Set renewal to expiration time. Changing expiration is not necessary
      // as renewal time will be displayed if it is the same as expiration time
      subToUpdate.renewal = subToUpdate.expiration;
      setSubscriptions(updatedSubscriptions);

      if (subToUpdate.productType === ProductType.Blackbird) {
        // Poll until the backend confirms resubscription so private server
        // pricing updates, but keep the current detail view open.
        setPollingTargetKey(subscriptionTargetKey);
        setPollingStatus(PollingStatus.RESUBSCRIBE);
      }

      if (currentSubscriptionView && !currSubscriptionIsPremium) {
        const currUserSub = currentSubscriptionView as UserSubscription;
        if (currUserSub.subscriptionTargetKey === subscriptionTargetKey) {
          // Should always be true, can only cancel the currently viewed subscription
          setCurrentSubscriptionView(subToUpdate);
        }
      }
    }
  };

  const onNotificationDismiss = (subscriptionTargetKey?: string) => {
    const updatedSubscriptions = [...subscriptions];
    const subToUpdate = updatedSubscriptions.find(
      sub => sub.subscriptionTargetKey === subscriptionTargetKey
    );

    if (subToUpdate) {
      subToUpdate.showLowBalanceNotification = false;
      setSubscriptions(updatedSubscriptions);
    }

    if (currentSubscriptionView) {
      const currUserSub = currentSubscriptionView as UserSubscription;
      if (currUserSub.subscriptionTargetKey === subscriptionTargetKey) {
        setCurrentSubscriptionView({
          ...currUserSub,
          showLowBalanceNotification: false
        });
      }
    }
  };

  const onPaymentProfileUpdate = (
    subscriptionTargetKey: string,
    paymentProfile: SavedPaymentProfile
  ) => {
    if (subscriptionTargetKey.startsWith('PRM') && premiumSubscription) {
      updatePremiumSubscriptionView({
        ...premiumSubscription,
        cardInfo: {
          cardNetwork: paymentProfile.providerPayload.CardNetwork,
          last4Digits: paymentProfile.providerPayload.Last4Digits,
          expMonth: paymentProfile.providerPayload.ExpMonth,
          expYear: paymentProfile.providerPayload.ExpYear
        },
        paymentProfileId: paymentProfile.id
      });
      return;
    }

    const updatedSubscriptions = [...subscriptions];
    const subToUpdate = updatedSubscriptions.find(
      sub => sub.subscriptionTargetKey === subscriptionTargetKey
    );

    if (subToUpdate) {
      subToUpdate.cardInfo = {
        cardNetwork: paymentProfile.providerPayload.CardNetwork,
        last4Digits: paymentProfile.providerPayload.Last4Digits,
        expMonth: paymentProfile.providerPayload.ExpMonth,
        expYear: paymentProfile.providerPayload.ExpYear
      };
      subToUpdate.paymentProfileId = paymentProfile.id;
    }

    if (currentSubscriptionView && subToUpdate) {
      const currUserSub = currentSubscriptionView as UserSubscription;
      if (currUserSub.subscriptionTargetKey === subscriptionTargetKey) {
        setCurrentSubscriptionView({
          ...currUserSub,
          cardInfo: subToUpdate.cardInfo
        });
      }
    }
  };

  const onPaymentProfileExpirationUpdate = (
    subscriptionTargetKey: string,
    paymentProfile: SavedPaymentProfile,
    newMonth: number,
    newYear: number
  ) => {
    const updatedPaymentProfile = {
      ...paymentProfile,
      providerPayload: { ...paymentProfile.providerPayload, ExpMonth: newMonth, ExpYear: newYear }
    };

    setPaymentProfiles([
      ...paymentProfiles.filter(pp => pp.id !== paymentProfile.id),
      updatedPaymentProfile
    ]);

    if (subscriptionTargetKey.startsWith('PRM') && premiumSubscription) {
      updatePremiumSubscriptionView({
        ...premiumSubscription,
        cardInfo: {
          cardNetwork: updatedPaymentProfile.providerPayload.CardNetwork,
          last4Digits: updatedPaymentProfile.providerPayload.Last4Digits,
          expMonth: updatedPaymentProfile.providerPayload.ExpMonth,
          expYear: updatedPaymentProfile.providerPayload.ExpYear
        },
        paymentProfileId: paymentProfile.id
      });
      return;
    }

    if (currentSubscriptionView) {
      const currUserSub = currentSubscriptionView as UserSubscription;
      if (currUserSub.subscriptionTargetKey === subscriptionTargetKey) {
        setCurrentSubscriptionView({
          ...currUserSub,
          cardInfo: {
            cardNetwork: updatedPaymentProfile.providerPayload.CardNetwork,
            last4Digits: updatedPaymentProfile.providerPayload.Last4Digits,
            expMonth: updatedPaymentProfile.providerPayload.ExpMonth,
            expYear: updatedPaymentProfile.providerPayload.ExpYear
          }
        });
      }
    }
  };

  // In the future, premium features api may return expired premium instead of 404 error -> null
  // So for now need to check if premium is expired before displaying it
  const premiumExpired = premiumSubscription ? premiumSubscription.expiration < new Date() : true;

  const subscriptionsOverview = (
    <React.Fragment>
      <h3 className='subscription-count font-header-2'>
        {translate('Heading.Subscriptions.Active', {
          activeNumber: combinedList.length + (premiumSubscription ? 1 : 0)
        })}
      </h3>
      <SubscriptionsList
        premiumSubscription={premiumExpired ? null : premiumSubscription}
        subscriptionList={combinedList}
        emptyText={translate('Description.Subscriptions.NoActive')}
        onSelectSubscription={onSelectSubscription}
        onSelectPrivateServer={onSelectPrivateServer}
        resultsPerPage={RESULTS_PER_PAGE}
        currentPage={activeSubsPage}
        onChangePage={setActiveSubsPage}
        isPriceLoading={pollingStatus != null}
      />
    </React.Fragment>
  );

  const subscriptionDetailsView = () => {
    if (currentPrivateServerView) {
      return (
        <PrivateServerDetails privateServer={currentPrivateServerView} onBack={onDetailsBack} />
      );
    }
    if (currentSubscriptionView) {
      const subscriptionView = currentSubscriptionView;
      return (
        <Fragment>
          <SubscriptionDetails
            subscription={subscriptionView}
            isPremium={currSubscriptionIsPremium}
            creditBalance={creditBalance}
            onStatusChange={onStatusChange}
            onNotificationDismiss={onNotificationDismiss}
            onBack={onDetailsBack}
            subscriptionMetadata={subscriptionMetadata}
            blackbirdProductInfo={blackbirdProductInfo}
            isFaeFreeTrial={isFaeFreeTrial}
            onEditPaymentMethodClick={() => {
              if (
                getPaymentProfile(
                  paymentProfiles,
                  subscriptionView.paymentProfileId,
                  subscriptionView.cardInfo
                ) !== undefined
              ) {
                openUpdateModal(subscriptionView);
              }
            }}
          />
          {subscriptionView.paymentProvider === PaymentProvider.STRIPE &&
            subscriptionView.paymentProfileId !== '' &&
            getPaymentProfile(
              paymentProfiles,
              subscriptionView.paymentProfileId,
              subscriptionView.cardInfo
            ) !== undefined &&
            canUserUseStripe && (
              <StripeElementsContainer>
                <UpdatePaymentProfileModal
                  subscriptionId={subscriptionView.subscriptionTargetKey}
                  isUserUnder18={isUserUnder18 && !isUserVpcVerified}
                  paymentProfiles={paymentProfiles}
                  isOpen={showUpdateModal}
                  subscription={subscriptionView}
                  onClose={closeUpdateModal}
                  onSave={paymentProfile => {
                    onPaymentProfileUpdate(subscriptionView.subscriptionTargetKey, paymentProfile);
                  }}
                  onPaymentProfileExpirationUpdate={(paymentProfile, newMonth, newYear) =>
                    onPaymentProfileExpirationUpdate(
                      subscriptionView.subscriptionTargetKey,
                      paymentProfile,
                      newMonth,
                      newYear
                    )
                  }
                  fetchSavedPaymentProfiles={fetchSavedPaymentProfiles}
                  defaultPaymentProfile={
                    getPaymentProfile(
                      paymentProfiles,
                      subscriptionView.paymentProfileId,
                      subscriptionView.cardInfo
                    ) ?? {
                      providerPayload: {
                        CardNetwork: '',
                        Last4Digits: '',
                        ExpMonth: 0,
                        ExpYear: 0
                      },
                      id: ''
                    }
                  }
                />
              </StripeElementsContainer>
            )}
        </Fragment>
      );
    }
    return null;
  };

  return (
    <div className='subscription-management-container'>
      <h2 className='subscription-title'>{translate('Heading.Tab.Subscriptions')}</h2>
      {subscriptionDetailsView() || subscriptionsOverview}
      <p
        className='subscription-help-text small text'
        // Would rather not use dangerouslySetInnerHTML, but it appears to be how all the
        // link translation strings are rendered.
        // In this case, the provided string is constant and not user provided, so its less dangerous.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: translate('Label.SubscriptionsHelpWithLink', {
            aTagStartWithHref: '<a href=',
            subscriptionsHelpPagesLink: `"${SUBSCRIPTIONS_HELP_LINK}"`,
            hrefEnd: ' class="text-link" target="_blank">',
            aTagEnd: '</a>'
          })
        }}
      />
      <SystemFeedback />
    </div>
  );
};

export default ManagementContainer;
