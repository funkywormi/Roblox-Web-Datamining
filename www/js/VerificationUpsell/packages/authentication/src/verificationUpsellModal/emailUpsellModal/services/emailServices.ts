import { get, post } from "@rbx/core-scripts/http";
import { TAuthMetadataV2Response } from "@rbx/authentication-common/types/signupTypes";
import { EmailStatusResponse } from "../../common/types/apiTypes";
import {
  getEmailUrlConfig,
  getEmailVerificationUrlConfig,
  getMetadataV2UrlConfig,
} from "../../common/constants/urlConstants";
import verificationUpsellConstants from "../constants/verificationUpsellConstants";
import getErrorCodeFromRequestError from "../../common/utils/requestUtils";
import getSettingsUIPolicy from "../../common/services/universalAppConfigurationService";

export const sendEmailVerification = () => {
  const urlConfig = getEmailVerificationUrlConfig();
  return post(urlConfig).then(
    () => {
      return true;
    },
    e => {
      return getErrorCodeFromRequestError(e);
    },
  );
};

export const updateEmailAddress = formData => {
  const urlConfig = getEmailUrlConfig();
  return post(urlConfig, formData).then(
    () => {
      return true;
    },
    e => {
      return getErrorCodeFromRequestError(e);
    },
  );
};

export const getUserEmailStatusAndOpenModal = async params => {
  const settingsUiPolicy = await getSettingsUIPolicy();
  const urlConfig = getEmailUrlConfig();
  return get<EmailStatusResponse>(urlConfig).then(
    ({ data }) => {
      if (!data?.emailAddress || (params.requireVerification && !data.verified)) {
        const event = new CustomEvent("OpenVerificationModal", {
          detail: {
            isEmailVerified: data.verified,
            email: data?.emailAddress,
            skipCallback: params.skipCallback,
            origin: params.origin,
            requireVerification: params.requireVerification,
            closeCallback: params.closeCallback,
            settingsUiPolicy,
          },
        });
        window.dispatchEvent(event);
      }
      return data;
    },
    e => {
      console.log(e);
      return false;
    },
  );
};

export const getMetadataV2 = async () => {
  const urlConfig = getMetadataV2UrlConfig();
  return get<TAuthMetadataV2Response>(urlConfig);
};

export const handleUserEmailUpsellAtLogout = async skipCallback => {
  const metadata = await getMetadataV2();
  if (!metadata.data?.IsEmailUpsellAtLogoutEnabled) {
    // see if ab test is turned off
    return false;
  }

  const { Logout } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({
    origin: Logout,
    skipCallback,
  });
};

// Variant of handleUserEmailUpsellAtLogout for callers (e.g. the prompts
// service-driven logout flow in `@rbx/authentication`) that have already
// resolved eligibility upstream. Skips:
//   - The `IsEmailUpsellAtLogoutEnabled` metadata check (caller's gate
//     replaces it).
//   - The "does the user already have an email" GET (caller's gate guarantees
//     the user is in the no-email/unverified target audience).
// Still fetches Settings UI policy (needed for rendering)
export const openLogoutEmailUpsellModal = async skipCallback => {
  const settingsUiPolicy = await getSettingsUIPolicy();
  const { Logout } = verificationUpsellConstants;
  const event = new CustomEvent("OpenVerificationModal", {
    detail: {
      origin: Logout,
      skipCallback,
      // Caller has already verified the user has no usable email; tell the
      // modal to render the "add email" page rather than "verify".
      isEmailVerified: false,
      email: undefined,
      requireVerification: false,
      settingsUiPolicy,
    },
  });
  window.dispatchEvent(event);
};

export const handleUserEmailUpsellAtBuyRobux = skipCallback => {
  const { BuyRobux } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: BuyRobux, skipCallback });
};

export const handleUserEmailUpsellOnHomePage = closeCallback => {
  const { HomePage } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: HomePage, closeCallback });
};

export const handleUserEmailVerificationRequiredByPurchaseWarning = () => {
  const { PurchaseWarning } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: PurchaseWarning, requireVerification: true });
};

export const handleUserEmailUpsellAtPremiumSubscription = skipCallback => {
  const { SubscriptionPurchase } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: SubscriptionPurchase, skipCallback });
};

export const handleUserEmailVerificationRequiredByBan = () => {
  const { NotApprovedPage } = verificationUpsellConstants;
  return getUserEmailStatusAndOpenModal({ origin: NotApprovedPage, requireVerification: true });
};

export const getUserEmailAddress = () => {
  const urlConfig = getEmailUrlConfig();
  return get<EmailStatusResponse>(urlConfig).then(
    ({ data }) => {
      return data?.emailAddress;
    },
    e => {
      console.log(e);
      return false;
    },
  );
};

export const validateEmailAddress = email => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};
