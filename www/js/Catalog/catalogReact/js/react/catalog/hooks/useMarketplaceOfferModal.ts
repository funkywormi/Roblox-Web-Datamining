import { useCallback, useEffect, useState } from 'react';
import { CurrentUser } from 'Roblox';
import { localStorageService } from 'core-roblox-utilities';
import {
  findFirstAvailableMarketplaceOffer,
  getMarketplaceOffers,
  MARKETPLACE_OFFERS_FEATURE_KEY
} from '../services/marketplaceSalesOffersService';
import type { MarketplaceOffer } from '../services/marketplaceSalesOffersService';

type OfferSurface = 'modal' | 'banner';

/** Dismissal timestamps per surface for a single offer. */
type OfferDismissals = Partial<Record<OfferSurface, number>>;

/** Map of offerId -> dismissals, stored under a single per-user key. */
type DismissedOffers = Record<string, OfferDismissals>;

function getDismissedOffersStorageKey(): string {
  return `Roblox.Catalog.MarketplaceOffers-${CurrentUser.userId}`;
}

function readDismissedOffers(): DismissedOffers {
  const stored = localStorageService.getLocalStorage(getDismissedOffersStorageKey()) as
    | DismissedOffers
    | null
    | undefined;
  return stored && typeof stored === 'object' ? stored : {};
}

function wasOfferDismissed(offerId: string, surface: OfferSurface): boolean {
  return !!readDismissedOffers()[offerId]?.[surface];
}

function markOfferDismissed(offerId: string, surface: OfferSurface): void {
  const dismissedOffers = readDismissedOffers();
  dismissedOffers[offerId] = { ...dismissedOffers[offerId], [surface]: Date.now() };
  localStorageService.setLocalStorage(getDismissedOffersStorageKey(), dismissedOffers);
}

export type UseMarketplaceOfferModalResult = {
  offer: MarketplaceOffer | null;
  showOfferModal: boolean;
  openOfferModal: () => void;
  closeOfferModal: () => void;
  confirmOfferModalDismiss: () => void;
  showOfferBanner: boolean;
  dismissOfferBanner: () => void;
};

export function useMarketplaceOfferModal(): UseMarketplaceOfferModalResult {
  const [offer, setOffer] = useState<MarketplaceOffer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showOfferBanner, setShowOfferBanner] = useState(false);

  useEffect(() => {
    if (!CurrentUser.isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    getMarketplaceOffers(MARKETPLACE_OFFERS_FEATURE_KEY)
      .then(offers => {
        if (cancelled) {
          return;
        }

        const availableOffer = findFirstAvailableMarketplaceOffer(offers);

        if (!availableOffer?.offerId) {
          return;
        }

        // Keep the offer available even if the modal was already dismissed so the
        // banner can persist independently.
        setOffer(availableOffer);

        if (!wasOfferDismissed(availableOffer.offerId, 'modal')) {
          setShowOfferModal(true);
        }

        if (
          !!availableOffer.localizedText?.trim() &&
          !wasOfferDismissed(availableOffer.offerId, 'banner')
        ) {
          setShowOfferBanner(true);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const openOfferModal = useCallback(() => {
    setShowOfferModal(true);
  }, []);

  const closeOfferModal = useCallback(() => {
    setShowOfferModal(false);
  }, []);

  const confirmOfferModalDismiss = useCallback(() => {
    if (offer?.offerId) {
      markOfferDismissed(offer.offerId, 'modal');
    }
    setShowOfferModal(false);
  }, [offer?.offerId]);

  const dismissOfferBanner = useCallback(() => {
    if (offer?.offerId) {
      markOfferDismissed(offer.offerId, 'banner');
    }
    setShowOfferBanner(false);
  }, [offer?.offerId]);

  return {
    offer,
    showOfferModal,
    openOfferModal,
    closeOfferModal,
    confirmOfferModalDismiss,
    showOfferBanner,
    dismissOfferBanner
  };
}

export default useMarketplaceOfferModal;
