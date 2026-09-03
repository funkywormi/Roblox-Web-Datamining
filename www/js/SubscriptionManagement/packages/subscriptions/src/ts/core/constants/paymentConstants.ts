import { EnvironmentUrls } from 'Roblox';
import { StripeElementsOptions } from '@stripe/stripe-js';

const DEV_PUBLIC_KEY =
  'pk_test_51LNOeQHDRNiW7vlLcKH8TGCpJ7zhaidLdSegE22GCuvQbVUX2xDiGJY6WYaldYyo6qgVxmy1SnSVpSdaqyjfqclU00NQwWntIe';
const STAGING_PUBLIC_KEY =
  'pk_test_51LNM0XG5RADBkfjhYJlpADA2ArzWIh7gTWTodYNbpEzSiT55dul3VJhaBIVHL0CNyO0gECOz1vPnWArAkjwQ8NBO00Cdf2PxED';
const PROD_PUBLIC_KEY =
  'pk_live_51LKpO9C8tJWGhK4HEHtny9Dg7xXiQJ1i349cq6KBDusbl8bRHO7QmCKKhX18LPjSirMNTvj3tesq6mhIQuPioeAd0062ZCgoF3';

export const STRIPE_ERROR_CODES = {
  INCORRECT_CVC: 'incorrect_cvc',
  CARD_DECLINED: 'card_declined',
  EXPIRED_CARD: 'expired_card'
};

export const TIME_BETWEEN_POLLS_IN_MS = 3000;

export const getStripePublicAPIKeyForEnv = (): string => {
  if (EnvironmentUrls.websiteUrl.includes('sitetest1')) return STAGING_PUBLIC_KEY;
  if (EnvironmentUrls.websiteUrl.includes('sitetest3')) return DEV_PUBLIC_KEY;
  return PROD_PUBLIC_KEY;
};

export const getStripeFormOptions = (clientSecret: string): StripeElementsOptions => {
  return {
    clientSecret,
    appearance: {
      theme: document.body.classList.contains('dark-theme') ? 'night' : 'stripe',
      labels: 'above',
      rules: {
        '.Input': {
          backgroundColor: document.body.classList.contains('dark-theme') ? 'black' : 'white'
        }
      }
    }
  };
};

export default {
  getStripePublicAPIKeyForEnv,
  getStripeFormOptions
};
