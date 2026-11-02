import React, {
  FormEvent,
  JSX,
  MouseEvent,
  UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { getAbsoluteUrl, getPageUrlLocale } from "@rbx/core-scripts/endpoints";
import {
  TranslationProvider,
  queryClient,
  useDebounce,
  useTranslation,
} from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { Button, Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import { ContentRatingMark } from "@rbx/content-rating-logos";
import { urlConstants as landingUrlConstants } from "../constants/landingConstants";
import BirthdayInput from "./BirthdayInput";
import GenderChips from "./GenderChips";
import LegalText from "./LegalText";
import MarketingConsentCheckbox from "./MarketingConsentCheckbox";
import UsernameInput from "./UsernameInput";
import { MARKETING_CONSENT_TRANSLATION_KEY } from "../constants/marketingConsentConstants";
import { signupFormStrings, urlConstants, validationMessages } from "../constants/signupConstants";
import { Gender } from "../types/signupTypes";
import { Birthday, constructValidUTCBirthdate } from "../utils/birthdayUtils";
import { usernameValidationMessage } from "../utils/signupUsernameValidation";
import useMarketingConsent from "../hooks/useMarketingConsent";
import useUsernameSuggestions from "../hooks/useUsernameSuggestions";
import UsernameSuggestions from "./UsernameSuggestions";
import {
  getUsernameRequirements,
  isUsernameUnavailable,
  UsernameAvailability,
  usernameRequirementErrorMessages,
  usernameRequirementLabels,
} from "../utils/usernameRequirementUtils";

import {
  UpgradeFailure,
  getUpgradeFailure,
  handleUpgradeComplete,
  isRestrictionAlreadyLifted,
  logout,
  upgradeAccount,
} from "../services/accountUpgradeService";
import { waitForMarketingConsentWrite } from "../services/marketingConsentService";
import { parseErrorCode } from "../utils/requestUtils";
import * as accountUpgradeAnalytics from "../services/accountUpgradeAnalytics";
import {
  birthdayComplianceTranslationKeys as translationConstants,
  birthdayComplianceTranslationConfig as translationConfig,
} from "../constants/birthdayComplianceConstants";

type BirthdayComplianceModalProps = {
  initialUsername?: string;
  navigateAfterUpgrade?: () => void;
};

function BirthdayComplianceModalContent({
  initialUsername,
  navigateAfterUpgrade,
}: BirthdayComplianceModalProps): JSX.Element {
  const { translate } = useTranslation();
  const user = authenticatedUser();
  // The session is server-rendered on the not-approved page but not on the login page, so
  // hosts that render the modal pre-auth pass the fetched username through initialUsername.
  // The meta tag can be stale when the session changed after the HTML request (an SSO popup
  // signed a fresh user in), so the freshly fetched initialUsername wins over it.
  const currentUsername = initialUsername ?? user?.name ?? "";
  // The meta user tag exists only when the user was logged in at the initial HTML request;
  // the heavy blur is reserved for that server-rendered-session case.
  const isBlurEnabled = user != null;

  const [birthdayParts, setBirthdayParts] = useState<Birthday>({});
  const [username, setUsername] = useState(currentUsername);
  const [gender, setGender] = useState<Gender>(Gender.unknown);
  const [failure, setFailure] = useState<UpgradeFailure>();
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [isConfirmingRatingGuide, setIsConfirmingRatingGuide] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const birthday = constructValidUTCBirthdate(birthdayParts);
  const setBirthdayPart = (part: keyof Birthday) => (value: number) => {
    const nextBirthdayParts = { ...birthdayParts, [part]: value };
    // Every pick that leaves a complete, valid date stands in for the Lua picker's confirm.
    if (constructValidUTCBirthdate(nextBirthdayParts) instanceof Date) {
      accountUpgradeAnalytics.reportBirthdayConfirmed();
    }
    setBirthdayParts(nextBirthdayParts);
    // A changed field invalidates the upgrade error about its previous value.
    setFailure(previousFailure =>
      previousFailure?.field === "birthday" ? undefined : previousFailure,
    );
  };
  const handleBirthdayDropdownOpenChange = (open: boolean) => {
    if (open) {
      accountUpgradeAnalytics.reportBirthdayFocused();
    }
  };

  // Clicking the selected chip clears it, so a clear reports the chip that was selected.
  const handleGenderChange = (nextGender: Gender) => {
    const pressedGender = nextGender === Gender.unknown ? gender : nextGender;
    if (pressedGender === Gender.male || pressedGender === Gender.female) {
      accountUpgradeAnalytics.reportGenderActivated(pressedGender);
    }
    setGender(nextGender);
  };

  // The agreement copy is translated HTML, so its link clicks are read off the wrapper.
  const handleLegalTextClick = (event: MouseEvent<HTMLDivElement>) => {
    const { target } = event;
    const href = target instanceof Element ? target.closest("a")?.getAttribute("href") : undefined;
    if (href?.startsWith(urlConstants.termsOfUse)) {
      accountUpgradeAnalytics.reportLegalLinkActivated("terms");
    } else if (href?.startsWith(urlConstants.privacy)) {
      accountUpgradeAnalytics.reportLegalLinkActivated("privacy");
    }
  };

  const isUsernameChanged = username !== currentUsername;
  const debouncedUsername = useDebounce(username, 250);
  // The current username is the user's own, so only a new one needs the availability check.
  const {
    data: usernameValidation,
    isFetching: isValidatingUsername,
    isPreviousData: isUsernameValidationStale,
  } = useQuery({
    queryKey: ["validate-username", debouncedUsername, birthday],
    queryFn: async () => {
      let isAvailabilityChecked = false;
      const message = await usernameValidationMessage(debouncedUsername, birthday ?? null, () => {
        isAvailabilityChecked = true;
      });
      return { message, isAvailabilityChecked };
    },
    keepPreviousData: true,
    enabled: debouncedUsername !== "" && debouncedUsername !== currentUsername,
  });
  const liveUsernameError =
    isUsernameChanged && usernameValidation?.message ? usernameValidation.message : undefined;
  // Only the settled result for the username in the field can confirm it is available.
  const isUsernameConfirmedAvailable =
    isUsernameChanged &&
    debouncedUsername === username &&
    !isValidatingUsername &&
    !isUsernameValidationStale &&
    usernameValidation?.isAvailabilityChecked === true &&
    usernameValidation.message === "";

  const [isRedirecting, setIsRedirecting] = useState(false);
  // The failure rate counts openings, so only the first failure in an opening reports it
  // (Lua's hasReportedFailureRef).
  const hasReportedFailureRef = useRef(false);

  useEffect(() => {
    accountUpgradeAnalytics.reportOpened();
  }, []);

  const marketingConsent = useMarketingConsent({
    birthday,
    consentText: translate(MARKETING_CONSENT_TRANSLATION_KEY),
  });

  const { mutate: submitUpgrade, isPending: isSubmitting } = useMutation({
    mutationFn: async (validBirthday: Date) => {
      let isAlreadyLifted = false;
      try {
        await upgradeAccount(validBirthday, isUsernameChanged ? username : undefined, gender);
      } catch (error) {
        if (!isRestrictionAlreadyLifted(error)) {
          throw error;
        }
        isAlreadyLifted = true;
      }
      // The consent write is legal proof of consent, so only a 200 from this upgrade starts
      // it. An "already upgraded" 403 never does.
      const pendingWrite = isAlreadyLifted ? undefined : marketingConsent.startWrite();
      // Reported before the poll starts, like Lua's reportSucceeded; an "already upgraded"
      // 403 counts as success because the modal treats it as one.
      accountUpgradeAnalytics.reportSucceeded();
      // The gateway can keep reporting the restriction for a few seconds; this polls the
      // not-approved status on a fixed schedule until it clears, then redirects.
      // Redirecting resolves the flow, but the browser stays on this page until the next
      // document loads — hold the loading state across that window so nothing re-enables
      // and no second upgrade can be submitted.
      // The page unload can cancel the consent write, so the redirect waits a bounded time for it.
      await handleUpgradeComplete(
        () => {
          setIsRedirecting(true);
        },
        navigateAfterUpgrade,
        pendingWrite === undefined ? undefined : () => waitForMarketingConsentWrite(pendingWrite),
      );
    },
    onError: error => {
      setFailure(getUpgradeFailure(error));
      // Like Lua: every failure sends authClientError; only the first failure while the
      // modal is open also reports the failure pageload and counter.
      accountUpgradeAnalytics.reportFailure(String(parseErrorCode(error) ?? "unknown"));
      if (!hasReportedFailureRef.current) {
        hasReportedFailureRef.current = true;
        accountUpgradeAnalytics.reportFirstFailure(String(parseErrorCode(error) ?? "unknown"));
      }
    },
  });

  // The mutation settles when the redirect starts, before the next document has loaded; the
  // redirecting flag carries the loading state across that window.
  const isUpgradeFlowBusy = isSubmitting || isRedirecting;

  const birthdayError =
    birthday === null
      ? validationMessages.birthdayInvalid
      : failure?.field === "birthday"
        ? failure.message
        : undefined;
  const usernameError =
    (username === "" ? undefined : liveUsernameError) ??
    (failure?.field === "username" ? failure.message : undefined);
  // The suggestions hook depends on the birthday Date's identity, so it is memoized on the
  // picked date parts rather than rebuilt every render, as SignUpV2's suggestionBirthdate is.
  const suggestionBirthday = useMemo(
    () => (birthday === null ? undefined : birthday),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the picked parts; `birthday` is derived from them
    [birthdayParts.year, birthdayParts.month, birthdayParts.day],
  );
  const isSuggestionsEnabled = usernameError === validationMessages.usernameAlreadyInUse;
  // The suggestions hook identity-stabilizes the callback it stores, but memoize these anyway
  // so the callback passed to the hook is stable across renders.
  const handleSuggestionsShown = useCallback(
    (usernameValue: string, suggestions: string[]): void => {
      accountUpgradeAnalytics.reportSuggestionsShown(usernameValue, suggestions);
    },
    [],
  );
  // Selecting a suggestion replaces the field and returns focus to it, as SignUpFormV2 does.
  const handleUsernameSuggestionSelect = useCallback((suggestion: string): void => {
    accountUpgradeAnalytics.reportSuggestionSelected(suggestion);
    setUsername(suggestion);
    setFailure(previousFailure =>
      previousFailure?.field === "username" ? undefined : previousFailure,
    );
    document.getElementById("birthday-compliance-username")?.focus();
  }, []);
  // Debounced like the validate call, so the suggestions endpoint is not hit on every keystroke.
  const usernameSuggestions = useUsernameSuggestions({
    username: debouncedUsername,
    birthday: suggestionBirthday,
    isEnabled: isSuggestionsEnabled,
    onSuggestionsShown: handleSuggestionsShown,
  });
  const isFormValid = birthday != null && username !== "" && liveUsernameError === undefined;

  // The current username is the user's own, so it counts as available. A changed one is
  // available once the validate endpoint accepts it, and unavailable on a taken response. If the
  // request fails (it can for restricted users), availability stays unknown.
  let usernameAvailability = UsernameAvailability.Unknown;
  if (!isUsernameChanged || isUsernameConfirmedAvailable) {
    usernameAvailability = UsernameAvailability.Available;
  } else if (usernameError !== undefined && isUsernameUnavailable(usernameError)) {
    usernameAvailability = UsernameAvailability.Unavailable;
  }
  const usernameRequirements = getUsernameRequirements(username, usernameAvailability).map(
    ({ id, isMet }) => ({ id, isMet, label: translate(usernameRequirementLabels[id]) }),
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isUpgradeFlowBusy || !isFormValid) {
      return;
    }
    accountUpgradeAnalytics.reportSaveClicked();
    setFailure(undefined);
    submitUpgrade(birthday);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    accountUpgradeAnalytics.reportCloseWarningClose();
    // The realtime client reloads this page when the logout triggers its SignOut notification,
    // and a reload of /not-approved bounces to /NewLogin?ReturnUrl=/not-approved. Replacing the
    // current history entry with the signup page makes that reload (or ours, whichever wins the
    // race) land on CreateAccount; restored if the logout request fails. Replacing (rather than
    // pushing) keeps Back from revisiting /not-approved and re-triggering the bounce.
    const originalUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.replaceState(null, "", "/CreateAccount");
    try {
      await logout();
    } catch {
      window.history.replaceState(null, "", originalUrl);
      // Stay on the confirmation so the user can retry.
      setIsLoggingOut(false);
      return;
    }
    window.location.href = getAbsoluteUrl("/CreateAccount");
  };

  // A close attempt (X button or Escape) asks for confirmation instead of leaving directly.
  const handleOpenChange = (open: boolean) => {
    if (open || isUpgradeFlowBusy || isLoggingOut) {
      return;
    }
    // Only the X and Escape reach here; both open the warning, so report the warning as
    // shown too (Lua's reportCloseButtonClicked does both).
    accountUpgradeAnalytics.reportCloseButtonClicked();
    setIsConfirmingClose(true);
  };

  const cancelClose = () => {
    if (!isLoggingOut) {
      accountUpgradeAnalytics.reportCloseWarningBack();
      setIsConfirmingClose(false);
    }
  };

  // Only Italy's mark is clickable (it opens the PEGI guide); Brazil's mark has no destination
  // and is rendered inert, so Continue always navigates to the guide.
  const handleRatingGuideConfirm = () => {
    setIsConfirmingRatingGuide(false);
    window.open(landingUrlConstants.italyContentRatingGuide, "_blank");
  };

  // Clicks outside a modal do nothing; only the X button and Escape can close the upgrade
  // modal, and only the confirmation's buttons can leave it. The handlers prevent Radix's
  // default outside-click dismissal (typed per the ReportNotificationModal precedent).
  const ignoreOutsideClick = {
    onPointerDownOutside: (event: UIEvent) => {
      event.preventDefault();
    },
    onInteractOutside: (event: UIEvent) => {
      event.preventDefault();
    },
  };

  // Modal over the page: the grey backdrop covers the surrounding content and blocks
  // interaction with it. Leaving requires the close confirmation, which logs the user out.
  return (
    <React.Fragment>
      <Dialog
        open
        isModal
        size="Large"
        hasCloseAffordance
        closeLabel={translate(translationConstants.closeButton)}
        onOpenChange={handleOpenChange}
      >
        <DialogContent
          className="outline-none"
          /* Blur the page behind the modal on top of the grey backdrop, so the surrounding
             content is unreadable while the restriction stands — only when the user was
             logged in at the initial HTML request (meta user tag present). Foundation
             Tailwind defines no backdrop-filter utilities (corePlugins is empty), so this is
             an arbitrary property; the -webkit- duplicate covers Safari. */
          overlayClassName={
            isBlurEnabled ? "[backdrop-filter:blur(64px)] [-webkit-backdrop-filter:blur(64px)]" : ""
          }
          /* The overlay, not the dialog, is the scroll container. Foundation centres grid items,
             which clips the top of anything taller than the viewport; starting the items at the
             top and centring with `margin-block: auto` on the dialog keeps it centred when it
             fits and scrollable when it does not. Scrolling here also leaves the dialog free of
             overflow, so the card's shadow is not clipped. */
          overlayStyle={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}
          /* Responsive width per the design: 480px on desktop, shrinking to the viewport minus
             margin on thin screens instead of overflowing (per the ProfileFrameDialog
             precedent). Large's min-width (300px) remains the floor.

             The dialog element itself is only the column that holds the card and the rating mark
             beneath it, so the two can never separate and the mark cannot fall outside the
             reachable area. The card keeps its natural height inside it; the overlay scrolls the
             column as a whole when it outgrows the viewport, and `margin-block: auto` centres it
             whenever it fits. No padding here: Foundation positions the close button against this
             element, and padding would leave the button outside the card. */
          style={{
            width: "min(480px, calc(100vw - 48px))",
            marginBlock: "auto",
            display: "flex",
            flexDirection: "column",
            background: "none",
            border: "none",
            boxShadow: "none",
          }}
          {...ignoreOutsideClick}
          onOpenAutoFocus={event => {
            // Radix would focus the first focusable element, the close button, which shows
            // its focus ring on open; preventing that leaves focus on the dialog container,
            // whose outline is suppressed by the className above. Keyboard focus stays inside
            // the modal either way.
            event.preventDefault();
          }}
        >
          {/* The card's surface, moved off the dialog element so the mark can sit outside it. */}
          <div className="radius-large bg-surface-100 stroke-muted stroke-standard shadow-transient-high flex flex-col">
            <form
              className="flex flex-col width-full padding-xxlarge"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="flex flex-col gap-none">
                {/* DialogTitle renders the page heading, wired for the dialog's aria-labelledby. */}
                <DialogTitle className="text-heading-small content-emphasis margin-none">
                  {translate(translationConstants.pageTitle)}
                </DialogTitle>
                <p className="text-body-medium content-default margin-none">
                  {translate(translationConstants.pageBody)}
                </p>
              </div>

              {/* Field spacing per the design: 24px between the title/description and the fields
                (margin-top-medium), 16px between the fields themselves. */}
              <div className="flex flex-col gap-large margin-top-medium">
                <BirthdayInput
                  birthday={birthdayParts}
                  error={birthdayError === undefined ? undefined : translate(birthdayError)}
                  isDisabled={isUpgradeFlowBusy}
                  isRequired
                  reserveErrorSpace={false}
                  onChangeYear={setBirthdayPart("year")}
                  onChangeMonth={setBirthdayPart("month")}
                  onChangeDay={setBirthdayPart("day")}
                  onOpenChangeYear={handleBirthdayDropdownOpenChange}
                  onOpenChangeMonth={handleBirthdayDropdownOpenChange}
                  onOpenChangeDay={handleBirthdayDropdownOpenChange}
                />

                <UsernameInput
                  id="birthday-compliance-username"
                  label={translate(signupFormStrings.Username)}
                  value={username}
                  isRequired
                  isDisabled={isUpgradeFlowBusy}
                  reserveErrorSpace={false}
                  error={usernameError ? translate(usernameError) : undefined}
                  requirements={usernameRequirements}
                  isErrorCoveredByRequirements={
                    usernameError !== undefined &&
                    usernameRequirementErrorMessages.has(usernameError)
                  }
                  onFocus={() => {
                    accountUpgradeAnalytics.reportUsernameFocused();
                  }}
                  onChange={nextUsername => {
                    setUsername(nextUsername);
                    // A changed field invalidates the upgrade error about its previous value.
                    setFailure(previousFailure =>
                      previousFailure?.field === "username" ? undefined : previousFailure,
                    );
                  }}
                />

                <UsernameSuggestions
                  label={translate(signupFormStrings.Try)}
                  suggestions={usernameSuggestions}
                  isDisabled={isUpgradeFlowBusy}
                  onSelect={handleUsernameSuggestionSelect}
                />

                <GenderChips
                  gender={gender}
                  isDisabled={isUpgradeFlowBusy}
                  size="Large"
                  onChange={handleGenderChange}
                />

                {marketingConsent.text !== undefined && (
                  <MarketingConsentCheckbox
                    text={marketingConsent.text}
                    isChecked={marketingConsent.isChecked}
                    isDisabled={isUpgradeFlowBusy || marketingConsent.isDisabled}
                    onToggle={marketingConsent.onToggle}
                  />
                )}
              </div>

              {/* 20px between the last field (the gender picker or the consent box) and the CTA
                per the design (margin-top-small); the inner 20px gap only spaces a form-level
                error from the CTA. */}
              <div className="flex flex-col gap-xlarge margin-top-small">
                {failure?.field === "form" && (
                  <p
                    aria-live="polite"
                    className="text-body-medium content-system-alert margin-none"
                  >
                    {translate(failure.message)}
                  </p>
                )}

                {/* The CTA and the legal text sit 8px apart per the design. */}
                <div className="flex flex-col gap-small">
                  <Button
                    type="submit"
                    variant="Emphasis"
                    size="Large"
                    className="width-full"
                    isDisabled={!isFormValid}
                    isLoading={isUpgradeFlowBusy}
                  >
                    {translate(translationConstants.createAccountButton)}
                  </Button>

                  {/* Styled like SignUpFormV2's legal slot; the legacy legal-text-container classes
                    the component renders have no stylesheet on this page. */}
                  {/* Watches the links inside rather than being a control itself; a keyboard activation
                    of a link fires a click too. */}
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- see above */}
                  <div
                    className="content-muted width-full margin-none text-caption-small [&_a]:underline"
                    onClick={handleLegalTextClick}
                  >
                    <LegalText
                      translationKey={signupFormStrings.SignUpAgreementCreateAnAccount}
                      locale={getPageUrlLocale()}
                      translate={translate}
                      usesInlineLinkTags
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* The country's legally required rating mark (Brazil CLASSIND / Italy PEGI), the same
              one the signup form shows under its card. It is a sibling of the card rather than a
              child, so it reads as "under the dialog" while still being in normal flow: the
              column that holds both is capped to the viewport and scrolls, so on a short screen
              the mark scrolls into view instead of hanging off the bottom edge out of reach. The
              mark carries its own 40px vertical margins, so the wrapper adds only a small offset.
              No id is passed: the page-level mark already owns the cypress selectors, and this
              modal can be open over a page that shows one. */}
          <div className="flex justify-center">
            <ContentRatingMark
              onMarkClick={() => {
                setIsConfirmingRatingGuide(true);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isConfirmingClose}
        isModal
        size="Small"
        hasCloseAffordance={false}
        onOpenChange={open => {
          // Outside clicks are blocked below; Escape dismisses the confirmation (as Back).
          if (!open) {
            cancelClose();
          }
        }}
      >
        <DialogContent
          className="outline-none"
          /* Small's max-width is exactly 320px, but its min-width (300px) plus the short
             content lets the dialog render narrower; pin it to the design width. */
          style={{ width: "min(320px, calc(100vw - 48px))" }}
          {...ignoreOutsideClick}
          onOpenAutoFocus={event => {
            // Radix would focus the first focusable element, the Back button, which shows
            // its focus ring on open; preventing that leaves focus on the dialog container,
            // whose outline is suppressed by the className above. Keyboard focus stays inside
            // the modal either way.
            event.preventDefault();
          }}
        >
          <DialogBody className="flex flex-col gap-[32px]">
            <div className="flex flex-col gap-none">
              <DialogTitle className="text-heading-small content-emphasis margin-none">
                {translate(translationConstants.closeWithoutFinishingTitle)}
              </DialogTitle>
              <p className="text-body-medium content-default margin-none">
                {translate(translationConstants.closeWithoutFinishingBody)}
              </p>
            </div>
            <div className="flex gap-medium">
              {/* Medium buttons render 14px label text (text-label-medium) per the design. */}
              <Button
                variant="Emphasis"
                size="Medium"
                className="width-full"
                onClick={cancelClose}
                isDisabled={isLoggingOut}
              >
                {translate(translationConstants.backButton)}
              </Button>
              <Button
                variant="Standard"
                size="Medium"
                className="width-full"
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- the button stays in its loading state until the logout settles
                  handleLogout();
                }}
                isDisabled={isLoggingOut}
                isLoading={isLoggingOut}
              >
                {translate(translationConstants.cancelButton)}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Leaving for the rating guide, the same confirmation the signup form shows. Escape
          dismisses it as Cancel; outside clicks are blocked, so only the buttons decide. */}
      <Dialog
        open={isConfirmingRatingGuide}
        isModal
        size="Medium"
        hasCloseAffordance={false}
        onOpenChange={open => {
          if (!open) {
            setIsConfirmingRatingGuide(false);
          }
        }}
      >
        <DialogContent
          className="outline-none"
          {...ignoreOutsideClick}
          onOpenAutoFocus={event => {
            // Same reasoning as the close confirmation: skip Radix's focus of the first
            // control so the dialog opens without a focus ring.
            event.preventDefault();
          }}
        >
          <DialogBody className="flex flex-col gap-xxlarge">
            <div className="flex flex-col gap-none">
              <DialogTitle className="text-heading-large content-emphasis margin-none">
                {translate(translationConstants.leavingRobloxTitle)}
              </DialogTitle>
              <p className="text-body-large content-default margin-none">
                {translate(translationConstants.leavingRobloxBody)}
              </p>
            </div>
            <div className="flex gap-medium">
              <Button
                variant="Emphasis"
                size="Large"
                className="width-full"
                onClick={handleRatingGuideConfirm}
              >
                {translate(translationConstants.continueButton)}
              </Button>
              <Button
                variant="Standard"
                size="Large"
                className="width-full"
                onClick={() => {
                  setIsConfirmingRatingGuide(false);
                }}
              >
                {translate(translationConstants.cancelButton)}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

/**
 * OAuth account-upgrade modal (birthday, optional username/gender). Always open; closing asks
 * for confirmation and then logs the user out. Once the upgrade succeeds (or the account turns
 * out to be already upgraded), polls the not-approved status until the restriction clears and
 * redirects home, or through `navigateAfterUpgrade` when the host has its own destination.
 * The host component must declare the `Authentication.SignUp`, `CommonUI.Controls`, and
 * `Feature.Landing` translation namespaces in its `component.json`.
 * `initialUsername` prefills the username field for hosts that render the modal before the
 * session is server-rendered (e.g. the login page); when passed it takes precedence over the
 * meta-tag user, which can be stale after an SSO popup signs a fresh user in.
 * TODO: migrate to `@rbx/www-common/i18n` together with BirthdayInput and GenderChips.
 */
export default function BirthdayComplianceModal({
  initialUsername,
  navigateAfterUpgrade,
}: BirthdayComplianceModalProps = {}): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider config={translationConfig}>
        <BirthdayComplianceModalContent
          initialUsername={initialUsername}
          navigateAfterUpgrade={navigateAfterUpgrade}
        />
      </TranslationProvider>
    </QueryClientProvider>
  );
}
