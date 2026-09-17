import { useCallback, useEffect, useRef, useState } from "react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { authenticatedUser, isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import tradesConstants from "../constants/tradesConstants";
import {
  buildNameForDisplay,
  canTrade,
  canTradeWith,
  counterTrade,
  getAllInventoryByUserId,
  getApiError,
  getErrorCodes,
  getTrade,
  getUserById,
  isAgeCheckEligibility,
  isFreeTradesLimitEligibility,
  refreshCanTrade,
  resolveCannotTradeAction,
  sendTrade,
} from "../services/tradesApi";
import {
  getTradeItemParameters,
  sendAXError,
  sendAXEvent,
  sendEvent,
  tradeEvents,
} from "../services/tradeEvents";
import { is2SVEnabled, startFacialAgeEstimation } from "../services/verification";
import { useTradesRouter } from "../tradesRouter";
import {
  DraftOffer,
  OfferSlot,
  SendTradeOffer,
  SendTradeRequest,
  SendTradeResponse,
  TradableItem,
  TradeUser,
} from "../types";
import { getCommonErrorMessage, getInvalidTradableItemLabel } from "../utils/tradeErrors";
import getEntryContext from "../utils/tradeEntryContext";
import { isCappedByFreeTrades, isRobuxAmountValid } from "../utils/tradesUtils";
import { log, warn } from "../utils/logger";
import useAgeCheckRequired from "./useAgeCheckRequired";
import useCurrencyTransfer from "./useCurrencyTransfer";
import useTradeQuota from "./useTradeQuota";
import useTwoStepVerification from "./useTwoStepVerification";

type SystemFeedbackService = {
  success: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
  warning: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
};

const { maxItemsPerSide, tradeErrors } = tradesConstants;

const buildSlots = (items: TradableItem[]): OfferSlot[] => {
  const slots: OfferSlot[] = [];
  for (let i = 0; i < maxItemsPerSide; i += 1) {
    if (items[i]) {
      slots.push({ type: "item", tradableItem: items[i] });
    } else if (i === 0 || items[i - 1]) {
      slots.push({ type: "add-item" });
    } else {
      slots.push({ type: "empty" });
    }
  }
  return slots;
};

const withSlots = (offer: DraftOffer): DraftOffer => ({ ...offer, slots: buildSlots(offer.items) });

export type UseTradeRequest = {
  loaded: boolean;
  initError: string | null;
  partner: TradeUser | null;
  offers: DraftOffer[];
  error: string | null;
  tradePending: boolean;
  isCounterTrade: boolean;
  isRobuxAmountValid: (robux: number | null) => boolean;
  toggleItem: (item: TradableItem) => void;
  removeItem: (item: TradableItem) => void;
  setRobux: (offerUserId: number, value: string) => void;
  onRobuxBlur: (offer: DraftOffer) => void;
  isItemInOffers: (item: TradableItem) => boolean;
  isItemUnavailable: (item: TradableItem) => boolean;
  doesItemHaveError: (item: TradableItem) => boolean;
  getItemErrorReason: (item: TradableItem) => string;
  /**
   * The partner cannot attach Robux (`canRequest` on can-trade), so their
   * Robux field is read-only on create and counter regardless of the viewer's own
   * eligibility.
   */
  isPartnerRobuxLocked: boolean;
  // Send flow.
  confirmSendOpen: boolean;
  requestSend: () => void;
  cancelSend: () => void;
  confirmSend: () => void;
  economicBody: string | null;
  dismissEconomic: () => void;
  verificationRedirectOpen: boolean;
  dismissVerificationRedirect: () => void;
  plusUpsellOpen: boolean;
  /** Title key when the pitch is for Robux in the offer rather than the monthly cap. */
  plusUpsellTitleKey?: string;
  dismissPlusUpsell: () => void;
  /** Prelude explaining the age check before the shared flow takes over. */
  ageCheckPromptOpen: boolean;
  dismissAgeCheckPrompt: () => void;
  startAgeCheck: () => void;
};

/**
 * Port of tradeRequestController: owns the draft offers for building a new trade
 * (create) or countering an existing one, plus validation, submit, the send
 * confirm/economic/2SV modals, and analytics.
 */
export const useTradeRequest = (systemFeedbackService: SystemFeedbackService): UseTradeRequest => {
  const { translate } = useTranslation();
  const { route, navigate } = useTradesRouter();

  // Resolved to processSend once it's defined below; lets the 2SV hook resume
  // the send after a successful challenge without reloading (which would
  // discard the drafted items/Robux).
  const retrySendRef = useRef<() => void>(() => {
    // Replaced with processSend once it's defined below.
  });
  const twoStepVerification = useTwoStepVerification(systemFeedbackService, {
    onVerificationSuccess: () => {
      retrySendRef.current();
    },
    onChallengeAbandoned: () => {
      // Keep the builder open if the user abandons the challenge, matching the
      // Angular tradeRequestController (onModalChallengeAbandoned: angular.noop).
    },
  });

  const [offers, setOffersState] = useState<DraftOffer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [partner, setPartner] = useState<TradeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tradePending, setTradePending] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [economicBody, setEconomicBody] = useState<string | null>(null);
  const [verificationRedirectOpen, setVerificationRedirectOpen] = useState(false);
  const [plusUpsellOpen, setPlusUpsellOpen] = useState(false);
  const [plusUpsellTitleKey, setPlusUpsellTitleKey] = useState<string | undefined>(undefined);
  const [ageCheckPromptOpen, setAgeCheckPromptOpen] = useState(false);
  const tradeQuota = useTradeQuota();
  const currencyTransfer = useCurrencyTransfer(partner?.id);
  const ageCheck = useAgeCheckRequired();

  // Refs mirror state for reads inside async callbacks / event handlers.
  const offersRef = useRef<DraftOffer[]>([]);
  const partnerRef = useRef<TradeUser | null>(null);
  const counterTradeIdRef = useRef<number | null>(null);
  const invalidItemIdsRef = useRef<Record<string, string | null>>({});
  const faeRetryAttemptedRef = useRef(false);
  // Set once the shared flow reports the check as passed. The cached can-trade
  // eligibility still says otherwise, so without this the offer would be gated
  // again the moment it resumes.
  const ageCheckPassedRef = useRef(false);
  // What to run once the check passes: the offer the viewer asked for, or the
  // send the trade API rejected.
  const resumeAfterAgeCheckRef = useRef<() => void>(() => {
    // Replaced whenever the prompt is opened.
  });
  const requestSendRef = useRef<() => void>(() => {
    // Replaced with requestSend once it's defined below.
  });

  const commitOffers = useCallback((next: DraftOffer[]) => {
    offersRef.current = next;
    setOffersState(next);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cleanUpInvalidTag = useCallback((item: TradableItem) => {
    if (item.id && invalidItemIdsRef.current[item.id]) {
      invalidItemIdsRef.current[item.id] = null;
    }
  }, []);

  const getOfferByUserId = (userId?: number): DraftOffer | undefined =>
    offersRef.current.find(offer => offer.user.id === userId);

  const isItemInOffers = useCallback((item: TradableItem): boolean => {
    const offer = getOfferByUserId(item.userId);
    return Boolean(offer?.items.some(existing => existing.id === item.id));
  }, []);

  const offerHasMaxItems = useCallback((userId?: number): boolean => {
    const offer = getOfferByUserId(userId);
    return Boolean(offer && offer.items.length >= maxItemsPerSide);
  }, []);

  const isItemUnavailable = useCallback(
    (item: TradableItem): boolean =>
      isItemInOffers(item) || offerHasMaxItems(item.userId) || Boolean(item.isOnHold),
    [isItemInOffers, offerHasMaxItems],
  );

  const doesItemHaveError = useCallback(
    (item: TradableItem): boolean => Boolean(item.id && invalidItemIdsRef.current[item.id]),
    [],
  );

  const getItemErrorReason = useCallback(
    (item: TradableItem): string =>
      getInvalidTradableItemLabel(item.id ? invalidItemIdsRef.current[item.id] : null, translate),
    [translate],
  );

  const addItemToOffer = useCallback(
    (item: TradableItem) => {
      const target = getOfferByUserId(item.userId);
      if (!target) {
        return;
      }
      if (target.items.length >= maxItemsPerSide) {
        return;
      }
      if (target.items.some(existing => existing.id === item.id)) {
        return;
      }
      if (item.isOnHold) {
        return;
      }

      commitOffers(
        offersRef.current.map(offer => {
          if (offer.user.id === item.userId) {
            return withSlots({ ...offer, items: [...offer.items, item] });
          }
          // Edge case: if ownership swapped, drop the item from the other side.
          return withSlots({ ...offer, items: offer.items.filter(i => i.id !== item.id) });
        }),
      );
      cleanUpInvalidTag(item);
      clearError();
    },
    [cleanUpInvalidTag, clearError, commitOffers],
  );

  const removeItem = useCallback(
    (item: TradableItem) => {
      commitOffers(
        offersRef.current.map(offer =>
          withSlots({ ...offer, items: offer.items.filter(i => i.id !== item.id) }),
        ),
      );
      cleanUpInvalidTag(item);
      clearError();
    },
    [cleanUpInvalidTag, clearError, commitOffers],
  );

  const toggleItem = useCallback(
    (item: TradableItem) => {
      if (isItemInOffers(item)) {
        removeItem(item);
        sendEvent(tradeEvents.tradeRequest, "itemRemoved");
      } else {
        addItemToOffer(item);
        sendEvent(tradeEvents.tradeRequest, "itemAdded");
      }
    },
    [addItemToOffer, isItemInOffers, removeItem],
  );

  // The two flags are independent after the backend split: `canSend` is the
  // viewer's Plus, `canRequest` is the partner's. A partner who cannot attach
  // Robux is a hard block no subscription of the viewer's would lift, so their
  // field is locked outright. The viewer's own ineligibility is a soft block
  // handled on send.
  const isPartnerRobuxLocked = currencyTransfer.isLoaded && !currencyTransfer.canRequest;
  // Read inside callbacks, which capture the first render's value.
  const isPartnerRobuxLockedRef = useRef(isPartnerRobuxLocked);
  isPartnerRobuxLockedRef.current = isPartnerRobuxLocked;

  // Eligibility usually resolves after the draft is seeded, so a countered
  // trade can arrive with Robux already on the partner's side. Drop it once the
  // answer says it cannot be requested, matching the now-locked field.
  useEffect(() => {
    if (!isPartnerRobuxLocked) {
      return;
    }
    const partnerId = partnerRef.current?.id;
    if (partnerId == null) {
      return;
    }
    const needsClearing = offersRef.current.some(
      offer => offer.user.id === partnerId && offer.robux !== null,
    );
    if (needsClearing) {
      commitOffers(
        offersRef.current.map(offer =>
          offer.user.id === partnerId ? { ...offer, robux: null } : offer,
        ),
      );
    }
  }, [commitOffers, isPartnerRobuxLocked, offers]);

  const setRobux = useCallback(
    (offerUserId: number, value: string) => {
      if (offerUserId === partnerRef.current?.id && isPartnerRobuxLockedRef.current) {
        return;
      }
      const trimmed = value.replace(/[^0-9]/g, "");
      let parsed: number | null = trimmed === "" ? null : parseInt(trimmed, 10);
      if (parsed === 0) {
        parsed = null; // so placeholder text shows (matches onOfferRobuxChange)
      }
      commitOffers(
        offersRef.current.map(offer =>
          offer.user.id === offerUserId ? { ...offer, robux: parsed } : offer,
        ),
      );
    },
    [commitOffers],
  );

  const onRobuxBlur = useCallback((offer: DraftOffer) => {
    if (offer.robux && offer.robux > 0) {
      sendEvent(tradeEvents.tradeRequest, "robuxAdded");
    }
  }, []);

  const hasItemsOnBothSides = (): boolean =>
    offersRef.current.length > 0 && offersRef.current.every(offer => offer.items.length > 0);

  const areRobuxAmountsValid = (): boolean =>
    offersRef.current.every(offer => isRobuxAmountValid(offer.robux));

  const isEligibleForSend = (): boolean => {
    clearError();
    if (!hasItemsOnBothSides()) {
      setError(translate("Label.OffersNeedItems"));
      return false;
    }
    if (!areRobuxAmountsValid()) {
      setError(translate("Error.InvalidRobux"));
      return false;
    }
    return true;
  };

  const getBodyForTradeRequest = (): SendTradeRequest => {
    const tradeOffers: SendTradeOffer[] = offersRef.current.map(offer => ({
      userId: offer.user.id,
      robux: offer.robux ? parseInt(String(offer.robux), 10) : 0,
      collectibleItemInstanceIds: offer.items.map(item => item.id!),
    }));
    const senderOffer = tradeOffers.find(offer => offer.userId === authenticatedUser()?.id);
    const recipientOffer = tradeOffers.find(offer => offer.userId !== authenticatedUser()?.id);
    return {
      senderOffer: senderOffer!,
      recipientOffer: {
        ...recipientOffer!,
        robux: isPartnerRobuxLockedRef.current ? 0 : recipientOffer!.robux,
      },
    };
  };

  const tradeHasRobux = (): boolean =>
    offersRef.current.some(offer => Boolean(offer.robux && offer.robux > 0));

  const showEconomicRestriction = (data: SendTradeResponse) => {
    const timeoutInHours = Math.ceil((data.ExpirationTimeInMinutes ?? 0) / 60);
    const violationKey =
      tradesConstants.economicRestrictionsViolationLabels[data.FailureReason ?? ""]!;
    const violation = translate(violationKey);
    const body =
      timeoutInHours > 24
        ? translate("Text.EconomicRestrictionsDaysGeneral", {
            violation,
            day: Math.ceil(timeoutInHours / 24),
          })
        : translate("Text.EconomicRestrictionsHoursGeneral", { violation, hour: timeoutInHours });
    setEconomicBody(body);
  };

  const getEventStreamErrorReason = (err: unknown): string => {
    const code = getApiError(err)?.code ?? getErrorCodes(err)[0];
    switch (code) {
      case tradeErrors.unauthorized:
        return "unauthorized";
      case tradeErrors.userCannotTrade:
        return "userCannotTrade";
      case tradeErrors.userPrivacyTooStrict:
        return "userPrivacyTooStrict";
      case tradeErrors.invalidUserAssets:
        return "invalidUserAssets";
      case tradeErrors.tradeUnbalanced:
        return "tradeUnbalanced";
      case tradeErrors.tradeQualityInsufficient:
        return "tradeQualityInsufficient";
      case tradeErrors.insufficientRobux:
        return "insufficientRobux";
      case tradeErrors.tooManyRobux:
        return "tooManyRobux";
      case tradeErrors.robuxRequiresPlus:
        return "robuxRequiresPlus";
      case tradeErrors.tradeFrictionEncountered:
        return "tradeFrictionEncountered";
      default:
        return "unknown";
    }
  };

  // Explains the age check before the shared flow takes over, and remembers
  // what the check was standing in the way of. Guarded against a second pass so
  // a still-blocked retry surfaces an error instead of looping.
  const promptAgeCheck = (resume: () => void) => {
    if (faeRetryAttemptedRef.current) {
      systemFeedbackService.warning(translate("Response.VerificationError"));
      return;
    }
    resumeAfterAgeCheckRef.current = resume;
    setAgeCheckPromptOpen(true);
  };

  // Handoff to the shared age-check flow, once the user has accepted the
  // prelude. The guard is spent here rather than when the prelude opens, so
  // dismissing the prelude leaves the user free to try the send again.
  const startAgeCheck = () => {
    setAgeCheckPromptOpen(false);
    faeRetryAttemptedRef.current = true;
    const source = counterTradeIdRef.current === null ? "send-trade" : "counter-trade";
    startFacialAgeEstimation(source)
      .then(hasAccess => {
        if (hasAccess) {
          ageCheckPassedRef.current = true;
          resumeAfterAgeCheckRef.current();
        }
      })
      .catch((error: unknown) => {
        warn("startAgeCheck: FAE flow failed", error);
        sendAXError("facialAgeEstimation", error as Error, { source });
        systemFeedbackService.warning(translate("Response.VerificationError"));
      });
  };

  const handleUserCannotTrade = (err: unknown) => {
    resolveCannotTradeAction(err)
      .then(action => {
        if (action === "ageCheck") {
          // The draft was already confirmed, so the check resumes the send
          // itself rather than reopening the confirmation.
          promptAgeCheck(() => {
            retrySendRef.current();
          });
          return;
        }
        if (action === "upsell" && !isBlackbirdUser()) {
          setPlusUpsellTitleKey(undefined);
          setPlusUpsellOpen(true);
          return;
        }
        systemFeedbackService.warning(translate("Error.TradeUsersCannotTrade"));
      })
      .catch(() => {
        systemFeedbackService.warning(translate("Error.TradeUsersCannotTrade"));
      });
  };

  const handleSendTradeError = (err: unknown) => {
    const apiError = getApiError(err);
    const code = apiError?.code ?? getErrorCodes(err)[0];

    switch (code) {
      case tradeErrors.unauthorized:
        systemFeedbackService.warning(translate("Error.TradeUnauthorized"));
        break;
      case tradeErrors.userCannotTrade:
        // Covers the age-check block too, which arrives under this code.
        handleUserCannotTrade(err);
        break;
      case tradeErrors.userPrivacyTooStrict:
        systemFeedbackService.warning(
          apiError?.field === "sender"
            ? translate("Error.YourPrivacyTooStrict")
            : translate("Error.PartnerPrivacyTooStrict"),
        );
        break;
      case tradeErrors.invalidUserAssets:
        // Enum not used in V2; other codes cover the cases.
        break;
      case tradeErrors.tradeUnbalanced:
        setError(translate("Error.TradeUnbalanced", { ratio: tradesConstants.minValueRatio }));
        break;
      case tradeErrors.tradeQualityInsufficient:
        setError(
          translate("Error.TradeQualityInsufficient", {
            minValue: formatNumber(Number(apiError?.fieldData) || 0),
          }),
        );
        break;
      case tradeErrors.insufficientRobux:
        setError(translate("Error.YouDoNotHaveEnoughRobux"));
        break;
      case tradeErrors.tooManyRobux:
        setError(
          translate(
            apiError?.field === "sender"
              ? "Error.RequestHasTooManyRobux"
              : "Error.OfferHasTooManyRobux",
            { percent: tradesConstants.maxRobuxAsPercentOfValue },
          ),
        );
        break;
      // This one is the partner's blocker, not the viewer's: the trade asks
      // someone without Plus to send Robux. The viewer subscribing would not
      // change that, so name the blocker rather than pitch the membership.
      // A viewer who is themselves ineligible is caught before the send.
      case tradeErrors.robuxRequiresPlus:
        systemFeedbackService.warning(
          translate(
            "Message.YouCanOnlyRequestRobuxFromPlusUsers",
            undefined,
            "This user needs Roblox Plus to send Robux as part of the trade",
          ),
        );
        break;
      case tradeErrors.tradeFrictionEncountered:
        is2SVEnabled()
          .then(enabled => {
            if (enabled) {
              twoStepVerification.start();
            } else {
              setVerificationRedirectOpen(true);
            }
          })
          .catch(() => {
            setVerificationRedirectOpen(true);
          });
        break;
      default:
        systemFeedbackService.warning(getCommonErrorMessage(code != null ? [code] : [], translate));
    }
  };

  const closeRequestWindow = useCallback(() => {
    navigate({ view: "list", tab: tradesConstants.tradeStatusType.outbound });
  }, [navigate]);

  const processSend = useCallback(() => {
    const currentOffers = offersRef.current;
    const isCounter = counterTradeIdRef.current !== null;
    const body = getBodyForTradeRequest();
    setTradePending(true);

    // Analytics expect [requested(partner), offered(me)] ordering.
    const offeredOffer = currentOffers.find(offer => offer.user.id === authenticatedUser()?.id);
    const requestedOffer = currentOffers.find(offer => offer.user.id !== authenticatedUser()?.id);
    const baseParameters: Record<string, string | number | boolean | null | undefined> = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...getTradeItemParameters({ offers: [requestedOffer, offeredOffer] } as any),
      hasRobux: tradeHasRobux(),
      partnerId: partnerRef.current?.id,
    };
    const eventContext = isCounter ? "counter" : "newTrade";

    const promise = isCounter ? counterTrade(counterTradeIdRef.current!, body) : sendTrade(body);

    promise.then(
      (tradeResponse: SendTradeResponse) => {
        setTradePending(false);

        if (
          tradeResponse.FailureReason !== undefined &&
          tradeResponse.ExpirationTimeInMinutes !== undefined
        ) {
          showEconomicRestriction(tradeResponse);
          return;
        }

        const parameters: Record<string, string | number | boolean | null | undefined> = {
          ...baseParameters,
          success: true,
        };
        if (tradeResponse?.tradeId) {
          parameters.tradeId = tradeResponse.tradeId;
        }
        sendEvent(tradeEvents.tradeRequestSent, eventContext, parameters);

        const entryContext = getEntryContext();
        sendAXEvent(
          isCounter ? tradeEvents.tradeCountered : tradeEvents.tradeInitiated,
          eventContext,
          {
            ...parameters,
            entrySource: entryContext.entrySource,
            referrer: entryContext.referrer,
          },
        );

        systemFeedbackService.success(
          translate(isCounter ? "Message.TradeCounteredSuccess" : "Message.TradeSentSuccess"),
        );
        refreshCanTrade();
        closeRequestWindow();
      },
      (err: unknown) => {
        sendEvent(tradeEvents.tradeRequestSent, eventContext, {
          ...baseParameters,
          success: false,
          reason: getEventStreamErrorReason(err),
        });
        sendAXError(isCounter ? "counterTrade" : "sendTrade", err as Error, {
          reason: getEventStreamErrorReason(err),
        });
        setTradePending(false);
        handleSendTradeError(err);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeRequestWindow, systemFeedbackService, translate]);

  // After a successful 2SV challenge, resume the send using the still-intact
  // draft (offersRef) rather than reloading the page.
  retrySendRef.current = processSend;

  const requestSend = useCallback(() => {
    // Each press of Send is a fresh attempt, so the one-shot age-check guard is
    // returned here (as TradeDetail does on accept). Spending it only inside a
    // single attempt is what keeps a still-blocked retry from looping; leaving
    // it spent would strand a viewer who abandoned the check with nothing but
    // an error until they reloaded.
    faeRetryAttemptedRef.current = false;
    // An age-check-ineligible viewer is on the builder on purpose (openNewTrade
    // skips the membership redirect for them), so the check they need is asked
    // for here instead of at the end of a confirmation the server would reject.
    // The rejection is still handled on send, for a viewer whose eligibility
    // could not be read up front or changed under them.
    if (ageCheck.isRequired && !ageCheckPassedRef.current) {
      promptAgeCheck(() => {
        requestSendRef.current();
      });
      return;
    }
    // Sending draws on the monthly allowance, so once it is spent the send is
    // replaced by the membership pitch rather than a confirmation the server
    // would only reject. Countering sends a trade too, so it is gated the same
    // way. This comes before validating the draft because no amount of fixing
    // the offer would get the send through.
    if (tradeQuota.isOutOfTrades) {
      setPlusUpsellTitleKey(undefined);
      setPlusUpsellOpen(true);
      return;
    }
    // A viewer who cannot attach Robux still builds their own side freely and
    // meets the pitch only here. Any Robux in the trade counts, because taking
    // part in a Robux exchange at all is what the membership unlocks. The
    // partner's field is a separate gate (`canRequest`) and may already be locked.
    if (currencyTransfer.isLoaded && !currencyTransfer.canSend && tradeHasRobux()) {
      setPlusUpsellTitleKey("Title.TradeWithRobuxWithPlus");
      setPlusUpsellOpen(true);
      return;
    }
    if (!isEligibleForSend()) {
      return;
    }
    clearError();
    invalidItemIdsRef.current = {};
    setConfirmSendOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ageCheck.isRequired,
    clearError,
    currencyTransfer.canSend,
    currencyTransfer.isLoaded,
    translate,
    tradeQuota.isOutOfTrades,
  ]);

  // Lets a passed age check pick the offer back up where the viewer left it.
  requestSendRef.current = requestSend;

  const cancelSend = useCallback(() => {
    setConfirmSendOpen(false);
  }, []);

  const confirmSend = useCallback(() => {
    setConfirmSendOpen(false);
    processSend();
  }, [processSend]);

  const dismissEconomic = useCallback(() => {
    setEconomicBody(null);
  }, []);
  const dismissVerificationRedirect = useCallback(() => {
    setVerificationRedirectOpen(false);
  }, []);
  const dismissPlusUpsell = useCallback(() => {
    setPlusUpsellOpen(false);
    setPlusUpsellTitleKey(undefined);
  }, []);
  const dismissAgeCheckPrompt = useCallback(() => {
    setAgeCheckPromptOpen(false);
  }, []);

  // ---- Initialization (openNewTrade / openCounterTrade) --------------------

  const makeOffer = useCallback(
    (user: TradeUser, robux: number | null, items: TradableItem[]): DraftOffer => {
      const isMyOffer = user.id === authenticatedUser()?.id;
      return withSlots({
        isMyOffer,
        label: translate(isMyOffer ? "Label.YourOffer" : "Label.YourRequest"),
        robux: robux ?? null,
        items: items || [],
        slots: [],
        user,
      });
    },
    [translate],
  );

  const addItemsById = useCallback(
    async (itemIds: string[], ownerUserId?: number) => {
      if (!itemIds.length || !ownerUserId) {
        return;
      }
      const idSet = new Set(itemIds);
      const allInventory = await getAllInventoryByUserId(ownerUserId);
      const itemsToAdd = allInventory
        .filter(item => idSet.has(item.collectibleItemInstanceId))
        .slice(0, maxItemsPerSide)
        .map(item => ({ ...item, userId: ownerUserId, id: item.collectibleItemInstanceId }));

      if (!itemsToAdd.length) {
        return;
      }

      commitOffers(
        offersRef.current.map(offer =>
          offer.user.id === ownerUserId
            ? withSlots({ ...offer, items: [...offer.items, ...itemsToAdd] })
            : offer,
        ),
      );
      itemsToAdd.forEach(cleanUpInvalidTag);
    },
    [cleanUpInvalidTag, commitOffers],
  );

  const addItemsFromUrl = useCallback(() => {
    if (typeof URLSearchParams === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const parseIds = (key: string): string[] =>
      (params.get(key) || "")
        .split(",")
        .map(str => str.trim())
        .filter(Boolean);

    const offeredItemIds = parseIds("oitems");
    const requestedItemIds = parseIds("ritems");

    if (offeredItemIds.length) {
      const myOffer = offersRef.current.find(offer => offer.isMyOffer);
      addItemsById(offeredItemIds, myOffer?.user.id).catch(err => {
        sendAXError("addItemsFromUrl", err);
      });
    }
    if (requestedItemIds.length) {
      const partnerOffer = offersRef.current.find(offer => !offer.isMyOffer);
      addItemsById(requestedItemIds, partnerOffer?.user.id).catch(err => {
        sendAXError("addItemsFromUrl", err);
      });
    }
  }, [addItemsById]);

  // Load the trade partner and seed the (empty) offers for a new trade. Called
  // only once canTradeWith has confirmed the pair is eligible.
  const loadTradePartner = useCallback(
    (userId: number) => {
      getUserById(userId)
        .then(partnerUser => {
          log("openNewTrade: loaded partner", partnerUser);
          const { id, name, displayName } = authenticatedUser() ?? {};
          const meUser: TradeUser = {
            id: id!,
            name: name!,
            displayName: displayName!,
            nameForDisplay: buildNameForDisplay(displayName, name),
          };
          const newOffers = [makeOffer(partnerUser, null, []), makeOffer(meUser, null, [])];
          setPartner(partnerUser);
          partnerRef.current = partnerUser;
          commitOffers(newOffers);
          setLoaded(true);
          addItemsFromUrl();
        })
        .catch((err: unknown) => {
          warn("openNewTrade: getUserById failed", err);
          sendAXError("loadTradePartner", err as Error);
          setInitError(translate("Message.InvalidUser"));
          systemFeedbackService.warning(translate("Message.InvalidUser"));
        });
    },
    [addItemsFromUrl, commitOffers, makeOffer, systemFeedbackService, translate],
  );

  const openNewTrade = useCallback(
    (userId: number) => {
      log("openNewTrade: userId=", userId, "me=", authenticatedUser()?.id);
      commitOffers([]);
      counterTradeIdRef.current = null;
      setLoaded(false);
      setInitError(null);

      // Gate the builder on the partner's tradability, mirroring the Angular
      // tradesController trade-with-user state (redirect on ineligible pairs so
      // a cold /users/{id}/trade load matches the legacy behavior).
      const { canTradeWithStatus, urls } = tradesConstants;
      // Soft sender blocks (age check, spent free trades) used to arrive as
      // SenderCannotTrade; can-trade is fetched in parallel to identify those
      // collapsed cases. Dedicated pair statuses are matched on the status
      // string, not on the viewer's own eligibility.
      Promise.all([canTradeWith(userId), canTrade().catch(() => null)])
        .then(([response, tradeResponse]) => {
          const status = response?.status;
          log(
            "openNewTrade: canTradeWith status=",
            status,
            "tradeEligibility=",
            tradeResponse?.tradeEligibility,
          );

          if (status === canTradeWithStatus.canTrade) {
            loadTradePartner(userId);
            return;
          }
          // Dedicated sender statuses (SenderAgeCheckRequired, and a spent
          // free-trades spelling if can-trade-with ever reports one) stay on
          // the builder so send can offer the check or Plus sheet. Match the
          // pair status itself — viewer can-trade eligibility must not override
          // CannotTradeWithSelf, UnknownError, empty, or receiver/privacy 403s.
          if (isAgeCheckEligibility(status) || isFreeTradesLimitEligibility(status)) {
            loadTradePartner(userId);
            return;
          }
          if (status === canTradeWithStatus.senderCannotTrade) {
            // Soft sender blocks used to collapse here. can-trade is the source
            // of truth for age-check and spent free trades; a remaining
            // allowance also stays so send can show the Plus sheet instead of
            // force-navigating to membership.
            if (
              isAgeCheckEligibility(tradeResponse?.tradeEligibility) ||
              isFreeTradesLimitEligibility(tradeResponse?.tradeEligibility) ||
              isCappedByFreeTrades(tradeResponse?.freeTradesAllowance)
            ) {
              loadTradePartner(userId);
              return;
            }
            window.location.href = urls.membership;
            return;
          }
          // CannotTradeWithSelf / UnknownError / empty response -> 400; anything
          // else the API reports (e.g. privacy/eligibility) -> 403.
          window.location.href =
            !status ||
            status === canTradeWithStatus.cannotTradeWithSelf ||
            status === canTradeWithStatus.unknownError
              ? urls.badRequest
              : urls.forbidden;
        })
        .catch((err: unknown) => {
          warn("openNewTrade: canTradeWith failed", err);
          sendAXError("canTradeWith", err as Error);
          window.location.href = urls.badRequest;
        });
    },
    [commitOffers, loadTradePartner],
  );

  const openCounterTrade = useCallback(
    (tradeId: number) => {
      log("openCounterTrade: tradeId=", tradeId);
      commitOffers([]);
      counterTradeIdRef.current = tradeId;
      setLoaded(false);
      setInitError(null);

      getTrade(authenticatedUser()?.id!, tradeId)
        .then(trade => {
          log("openCounterTrade: loaded trade", trade);
          if (!trade || !trade.offers) {
            warn("openCounterTrade: trade has no offers", trade);
            setInitError(translate("Error.TradeUnknownError"));
            return;
          }
          // A participant's user can be null (deleted/moderated account). Such a
          // trade can't be countered (we'd have no partner to build an offer
          // for), so bail with an error instead of dereferencing a null user.
          if (trade.offers.some(offer => !offer.user)) {
            warn("openCounterTrade: trade has a moderated/null participant", trade);
            setInitError(translate("Error.TradeUnknownError"));
            return;
          }
          const newOffers = trade.offers.map(offer => {
            const items = offer.items.map(item => ({
              ...item,
              id: item.collectibleItemInstanceId,
              userId: offer.user.id,
            }));
            const user: TradeUser = {
              ...offer.user,
              nameForDisplay: trade.user?.nameForDisplay ?? offer.user.nameForDisplay,
            };
            return makeOffer(user, offer.robux, items);
          });
          const partnerUser = newOffers.find(offer => !offer.isMyOffer)?.user ?? null;
          setPartner(partnerUser);
          partnerRef.current = partnerUser;
          commitOffers(newOffers);
          setLoaded(true);
        })
        .catch((err: unknown) => {
          warn("openCounterTrade: getTrade failed", err);
          sendAXError("openCounterTrade", err as Error);
          setInitError(translate("Error.TradeUnknownError"));
          systemFeedbackService.warning(translate("Error.TradeUnknownError"));
        });
    },
    [commitOffers, makeOffer, systemFeedbackService, translate],
  );

  useEffect(() => {
    log("useTradeRequest init effect for route", route);
    if (route.view === "create" && route.userId) {
      openNewTrade(route.userId);
    } else if (route.view === "counter" && route.tradeId) {
      openCounterTrade(route.tradeId);
    } else {
      warn("useTradeRequest: route missing required params", route);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.view, route.userId, route.tradeId]);

  return {
    loaded,
    initError,
    partner,
    offers,
    error,
    tradePending,
    isCounterTrade: counterTradeIdRef.current !== null,
    isRobuxAmountValid,
    toggleItem,
    removeItem,
    setRobux,
    onRobuxBlur,
    isItemInOffers,
    isItemUnavailable,
    doesItemHaveError,
    getItemErrorReason,
    isPartnerRobuxLocked,
    confirmSendOpen,
    requestSend,
    cancelSend,
    confirmSend,
    economicBody,
    dismissEconomic,
    verificationRedirectOpen,
    dismissVerificationRedirect,
    plusUpsellOpen,
    plusUpsellTitleKey,
    dismissPlusUpsell,
    ageCheckPromptOpen,
    dismissAgeCheckPrompt,
    startAgeCheck,
  };
};

export default useTradeRequest;
