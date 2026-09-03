import { TranslationConfig } from "react-utilities";
import { ForceActionRedirect } from "@rbx/generic-challenge-types";
import { useTrustedSessionCount } from "../../common/hooks/useSessionsQuery";
import { sessionManagementLinkWithRedirect } from "../../../common/urls";
import { calculateDelayOffset, shouldTrustOtherSessions } from "../twoStepVerification/delay/text";
import { DelayParameters } from "../twoStepVerification/delay";

export const FEATURE_NAME = "ForceActionRedirect" as const;
export const LOG_PREFIX = "ForceActionRedirect:" as const;

// This is the 2-Step Verification path in Account Settings.
export const ACCOUNT_SETTINGS_SECURITY_PATH = "/my/account#!/security?src=";

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
const FORCE_AUTHENTICATOR_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: "Feature.ForceAuthenticator",
};

const FORCE_TWO_STEP_VERIFICATION_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: "Feature.ForceTwoStepVerification",
};

const BLOCK_SESSION_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: "Feature.Denied",
};

/**
 * Language resource keys for force authenticator that are requested dynamically.
 */
export const FORCE_AUTHENTICATOR_LANGUAGE_RESOURCES = [
  "Action.Setup",
  "Description.Reason",
  "Description.SetupAuthenticator",
  "Header.TurnOnAuthenticator",
] as const;

export const FORCE_TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES = [
  "ForceTwoStepVerification.Header",
  "ForceTwoStepVerification.Body",
  "ForceTwoStepVerification.Action",
] as const;

// Intentionally not a const anymore as we will be loading these resource keys dynamically from
// the service. This means this is no longer exhaustive / typesafe...
export const BLOCK_SESSION_LANGUAGE_RESOURCES = [
  "Denied.Header",
  "Denied.Body",
  "Denied.Action",
  "Denied.Delayed.BodyWithTrustedSession",
];

// translationsParametersByKey populates translation key templates by their key. Dynamic key
// users should populate these *before* returning new dynamic keys from GCC (or any other
// server-vended code).
export const translationsParametersByKey = (
  translationKey: string,
  delayParameters?: DelayParameters,
  translate?: ForceActionRedirect.ForceActionRedirectTranslateFunction,
): Record<string, string> => {
  switch (translationKey) {
    case "Denied.AutomatedTampering.Body": {
      return {
        linkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/204038784-General-Website-Issues" 
          class="text-link"
          target="_blank">`,
        linkEnd: "</a>",
      };
    }
    case "Denied.DeviceBlock.Body": {
      return {
        communityStandardsLinkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/203313410-Roblox-Community-Standards"
          class="text-link"
          target="_blank">`,
        communityStandardsLinkEnd: "</a>",
        appealLinkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/360000245263-Appeal-Your-Content-or-Account-Moderation?src=contact_us"
        class="text-link"
        target="_blank">`,
        appealLinkEnd: "</a>",
      };
    }
    case "Denied.DeviceBlockCredentialVariant.Body": {
      return {
        communityStandardsLinkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/203313410-Roblox-Community-Standards"
          class="text-link"
          target="_blank">`,
        communityStandardsLinkEnd: "</a>",
        appealLinkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/360000245263-Appeal-Your-Content-or-Account-Moderation?src=contact_us"
        class="text-link"
        target="_blank">`,
        appealLinkEnd: "</a>",
      };
    }
    case "Denied.Delayed.BodyWithTrustedSession":
    case "Denied.Delayed.Body": {
      if (!delayParameters?.delayUntil || !translate) {
        return {};
      }
      const offset = calculateDelayOffset({
        timestamp: delayParameters.delayUntil,
        dayTranslation: () => translate("Denied.Delayed.Header.Day"),
        hourTranslation: () => translate("Denied.Delayed.Header.Hour"),
        minuteTranslation: () => translate("Denied.Delayed.Header.Minute"),
      });
      if (!offset) {
        return {};
      }
      if (translationKey === "Denied.Delayed.BodyWithTrustedSession") {
        return {
          numberOfUnits: offset.numberOfUnits,
          unitOfTime: offset.unitOfTime,
          linkStart: `<a href="${sessionManagementLinkWithRedirect}" class="text-link">`,
          linkEnd: "</a>",
        };
      }
      return {
        numberOfUnits: offset.numberOfUnits,
        unitOfTime: offset.unitOfTime,
      };
    }
    case "Denied.TryTrusted.Body": {
      return {
        securitySettingsLinkStart: `<a href="${ACCOUNT_SETTINGS_SECURITY_PATH}"
          class="text-link"
          target="_blank">`,
        supportLinkStart: `<a href="/support"
        class="text-link"
        target="_blank">`,
        linkEnd: "</a>",
      };
    }
    default: {
      return {};
    }
  }
};

// Hook that resolves the body translation key, multiplexing to the trusted-session
// variant when the user has trusted sessions and the key is delay-related.
//
// This only exists because we don't have a binding in GCS to show **all** trusted sessions;
// this would require a rework all the way up to RIS. Which we don't have time for.
export const useMaybeConditionalDynamicBody = (
  maybeConditionalKey: string,
  translate: ForceActionRedirect.ForceActionRedirectTranslateFunction,
  delayParameters?: DelayParameters,
): string => {
  const trustedSessionCount = useTrustedSessionCount();

  switch (maybeConditionalKey) {
    case "Denied.Delayed.Body": {
      if (
        trustedSessionCount &&
        trustedSessionCount > 0 &&
        delayParameters?.delayUntil &&
        shouldTrustOtherSessions(delayParameters)
      ) {
        const augmentedKey = "Denied.Delayed.BodyWithTrustedSession";
        return translate(
          augmentedKey,
          translationsParametersByKey(augmentedKey, delayParameters, translate),
        );
      }
      return translate(
        maybeConditionalKey,
        translationsParametersByKey(maybeConditionalKey, delayParameters, translate),
      );
    }
    default: {
      return translate(maybeConditionalKey, translationsParametersByKey(maybeConditionalKey));
    }
  }
};

export const getForceActionRedirectChallengeConfig = ({
  forceActionRedirectChallengeType,
  actionTranslationKey,
  bodyTranslationKey,
  headerTranslationKey,
  delayParameters,
}: Pick<
  ForceActionRedirect.ChallengeParameters,
  | "forceActionRedirectChallengeType"
  | "actionTranslationKey"
  | "bodyTranslationKey"
  | "headerTranslationKey"
  | "delayParameters"
>): ForceActionRedirect.ForceActionRedirectChallengeConfig => {
  switch (forceActionRedirectChallengeType) {
    case ForceActionRedirect.ForceActionRedirectChallengeType.ForceAuthenticator:
      return {
        redirectURLSignifier: "forceauthenticator" as const,
        translationConfig: FORCE_AUTHENTICATOR_TRANSLATION_CONFIG,
        translationResourceKeys: ForceActionRedirect.FORCE_AUTHENTICATOR_LANGUAGE_RESOURCES,
        getTranslationResources: (
          translate: ForceActionRedirect.ForceActionRedirectTranslateFunction,
        ) =>
          ({
            Header: translate("Header.TurnOnAuthenticator"),
            // TODO: Consolidate both of these description resources under a single resource.
            Body: `${translate("Description.SetupAuthenticator")}\n${translate(
              "Description.Reason",
            )}`,
            Action: translate("Action.Setup"),
          }) as const,
      };
    case ForceActionRedirect.ForceActionRedirectChallengeType.ForceTwoStepVerification:
      return {
        redirectURLSignifier: "forcetwostepverification" as const,
        translationConfig: FORCE_TWO_STEP_VERIFICATION_TRANSLATION_CONFIG,
        translationResourceKeys: ForceActionRedirect.FORCE_TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES,
        getTranslationResources: (
          translate: ForceActionRedirect.ForceActionRedirectTranslateFunction,
        ) =>
          ({
            Header: translate("ForceTwoStepVerification.Header"),
            Body: translate("ForceTwoStepVerification.Body"),
            Action: translate("ForceTwoStepVerification.Action"),
          }) as const,
      };
    case ForceActionRedirect.ForceActionRedirectChallengeType.BlockSession:
      return {
        redirectURLSignifier: "blocksession" as const,
        translationConfig: BLOCK_SESSION_TRANSLATION_CONFIG,
        translationResourceKeys: ForceActionRedirect.BLOCK_SESSION_LANGUAGE_RESOURCES,
        getTranslationResources: (
          translate: ForceActionRedirect.ForceActionRedirectTranslateFunction,
        ) => {
          const maybeDynamicHeaderKey = headerTranslationKey || "Denied.Header";
          const maybeDynamicBodyKey = bodyTranslationKey || "Denied.Body";
          const maybeDynamicActionKey = actionTranslationKey || "Denied.Action";
          return {
            Header: translate(
              maybeDynamicHeaderKey,
              translationsParametersByKey(maybeDynamicHeaderKey),
            ),
            Body: translate(
              maybeDynamicBodyKey,
              translationsParametersByKey(maybeDynamicBodyKey, delayParameters, translate),
            ),
            Action: translate(
              maybeDynamicActionKey,
              translationsParametersByKey(maybeDynamicActionKey),
            ),
          } as const;
        },
      };
    default:
      throw new Error("Invalid ForceActionRedirectChallengeType");
  }
};
