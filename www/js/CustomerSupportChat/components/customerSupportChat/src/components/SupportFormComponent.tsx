import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import classNames from "classnames";
import { FaceFrownIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";
import { Checkbox, TCheckboxCheckState } from "@rbx/foundation-ui";
import { WithTranslationsProps, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { supportChatTranslationConfig } from "../app.config";
import { SupportTicketStateKey, SupportTicketSelectableItems } from "../core/types/supportTicket";
import DropdownMenu from "./common/dropdown/DropdownMenu";
import {
  AppRoute,
  GenericResponse,
  Item,
  SelectedItems,
  SupportFormState,
  SupportedReceivedValues,
  SupportContextKey,
} from "../core/types/common";
import {
  defaultMaxInputFieldLength,
  defaultMaxIssueDescriptionFieldLength,
  defaultTicketFormFields,
  defaultTicketFormSelectables,
  ticketSupportArticleEventType,
} from "../core/constants/supportTicketConstants";
import { SupportContext } from "../providers/SupportContextProvider";
import {
  EventName,
  dispatchTelemetryEvent,
  getAndValidateQueryParam,
  getFormFieldErrors,
  isUsernameRequiredForCategory,
  toSupportTicketRequestModel,
} from "../core/helpers/supportFormHelpers";
import { useSubmitSupportForm, useValidateUsername } from "../hooks/supportFormServices";
import { AgeGateDOBGroupLabel } from "../core/types/ageGate";
import { clearSierraChatSession } from "../core/helpers/sierraSessionStorageManager";
import useNav from "../hooks/useNav";
import useScrollToTop from "../hooks/useScrollTop";
import { MessageModalConfig, useConfirmDialog } from "./modal/MessageModal";
import ArticleSuggestions from "./article-suggestions/ArticleSuggestions";
import { SubCategory } from "../core/types/serviceMetadataResponse";
import DevModeComponent from "./DevModeComponent";
import useAppealsPortalGuacConfiguration from "../hooks/useAppealsPortalGuacConfiguration";
import { useEmailVerification } from "../hooks/useEmailVerification";
import OTPModal from "./modal/OTPModal";
import VerificationCodeModal from "./modal/VerificationCodeModal";

declare global {
  interface Window {
    __ROBLOX_DEBUG_SUPPORT_FORM__?: {
      conversationId?: string;
    };
  }
}

/**
 * These subcategories will render an optional asset ID field. AppealContent can be removed if the Misc
 * Appeals Form is added again since users will be redirected to the Violations & Appeals page.
 *
 * AppealNonAssetContent was reused for the DSA Appeal subcategory which is why it may seem odd that asset
 * ID is shown for "non asset content".
 */
const ASSET_ID_SUBCATEGORIES: string[] = [
  SubCategory.AppealContent,
  SubCategory.AppealNonAssetContent,
  SubCategory.AppealForChild,
];

/**
 * These subcategories will render an optional universe ID field to help identify
 * the specific experience being reported. Includes both experience genre appeals
 * and content maturity subcategories.
 */
const UNIVERSE_ID_SUBCATEGORIES: string[] = [
  SubCategory.AppealExperienceGenre,
  SubCategory.ContentMaturityAppeal,
  SubCategory.ContentMaturityAppealRestore,
  SubCategory.ContentMaturityRejectAppeal,
];

export const UnwrappedSupportFormComponent: React.FC<WithTranslationsProps> = ({
  translate: t,
}) => {
  // Form context and field input state
  useScrollToTop();
  const { metadata, ageGateTag, updateSupportInquiryContext } = useContext(SupportContext);

  const { data: guacConfig, isLoading: isLoadingGuacConfig } = useAppealsPortalGuacConfiguration();

  const { pushSegment } = useNav();
  const [selectedItems, setSelectedItems] = useState<SelectedItems<SupportTicketStateKey>>(
    defaultTicketFormSelectables,
  );
  const [supportFormData, setSupportFormData] = useState<SupportFormState>(defaultTicketFormFields);

  const userViewedHelpArticleRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Email verification hook
  const {
    showModal: showEmailVerificationModal,
    code: verificationCode,
    codeError: verificationCodeError,
    sendCodeError,
    isValidatingCode,
    isCodeVerified,
    isResendEnabled,
    timeUntilResend,
    isResending,
    isSendingCode,
    otpSessionToken,
    verify: verifyEmail,
    handleCodeChange: handleVerificationCodeChange,
    handleResendCode,
    closeModal: closeEmailVerificationModal,
    resetVerification,
  } = useEmailVerification(t);

  // Auto-submit form after successful email verification
  useEffect(() => {
    if (isCodeVerified && metadata?.isEmailVerificationRequired) {
      // Small delay to allow modal close animation to finish
      const timer = setTimeout(() => {
        const form = formRef.current;
        if (form) {
          form.requestSubmit();
        }
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [isCodeVerified, metadata?.isEmailVerificationRequired]);

  // We can get to the support page from an help center article
  // if that's the case, we want to pass the article id and lang to the support form
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const helpCenterArticleId = getAndValidateQueryParam(queryParams, "articleId");
  const helpCenterArticleLang = getAndValidateQueryParam(queryParams, "articleLang");

  /**
   * Certain appeal subcategories will render an optional asset ID field to make which
   * can be used to route the appeal to Toolbox instead of Zendesk if applicable.
   */
  const [showAssetIdField, setShowAssetIdField] = useState(false);
  useEffect(() => {
    setShowAssetIdField(
      ASSET_ID_SUBCATEGORIES.includes(
        selectedItems[SupportTicketStateKey.HelpSubCategoryType]?.id ?? "",
      ),
    );
  }, [selectedItems]);

  /**
   * Universe ID field is shown for experience genre appeals and content maturity subcategories.
   */
  const [showUniverseIdField, setShowUniverseIdField] = useState(false);
  useEffect(() => {
    setShowUniverseIdField(
      UNIVERSE_ID_SUBCATEGORIES.includes(
        selectedItems[SupportTicketStateKey.HelpSubCategoryType]?.id ?? "",
      ),
    );
  }, [selectedItems]);

  /**
   * For logged in UK users, we need to show the opt-out communication checkbox for the "Appeal a decision"
   * main category. This is required by UK OSA.
   */
  const showOptOutCommunicationCheckbox = useMemo(() => {
    return (
      authenticatedUser.isAuthenticated &&
      guacConfig?.EnableOptOutCommunication &&
      selectedItems[SupportTicketStateKey.HelpCategoryType]?.val === "AppealDecision"
    );
  }, [selectedItems, guacConfig, authenticatedUser]);

  // Memoize all dropdown selectable configs from metadata response
  const selector: SupportTicketSelectableItems = useMemo(
    () => ({
      [SupportTicketStateKey.DeviceType]: {
        key: SupportTicketStateKey.DeviceType,
        label: t("Label.DeviceType"),
        items:
          metadata?.deviceTypes?.map((deviceType, index) => ({
            id: deviceType.identifier,
            name: deviceType.description,
            val: deviceType.name,
            intVal: index,
          })) ?? [],
      },
      [SupportTicketStateKey.HelpCategoryType]: {
        key: SupportTicketStateKey.HelpCategoryType,
        label: t("Label.HelpCategoryType"),
        items:
          metadata?.categories?.map((category, index) => ({
            id: category.mainCategory.identifier,
            name: category.mainCategory.description,
            val: category.mainCategory.name,
            intVal: index,
          })) ?? [],
      },
      [SupportTicketStateKey.HelpSubCategoryType]: {
        key: SupportTicketStateKey.HelpSubCategoryType,
        label: t("Label.HelpSubCategoryType"),
        items:
          metadata?.categories
            ?.find(
              c =>
                c.mainCategory.identifier ===
                selectedItems[SupportTicketStateKey.HelpCategoryType]?.id,
            )
            ?.subCategories?.map((subCategory, index) => ({
              id: subCategory.identifier,
              name: subCategory.description,
              val: subCategory.name,
              intVal: index,
            })) ?? [],
      },
    }),
    [metadata?.categories, metadata?.deviceTypes, selectedItems, t],
  );
  const {
    deviceType: deviceTypeSelectable,
    helpCategoryType: helpCatTypeSelectable,
    helpSubCategoryType: helpSubCatTypeSelectable,
  } = selector;

  /**
   * Tickets without a username are not eligible for chatbot flows. For the
   * categories listed in USERNAME_REQUIRED_CATEGORIES we require username
   * up front to improve automation rates.
   */
  const isUsernameRequired = useMemo(
    () => isUsernameRequiredForCategory(selectedItems[SupportTicketStateKey.HelpCategoryType]?.val),
    [selectedItems],
  );

  // fields that are required to submit the form
  const requiredFields = useMemo(() => {
    const fields = [
      SupportTicketStateKey.Email,
      SupportTicketStateKey.ConfirmEmail,
      SupportTicketStateKey.DeviceType,
      SupportTicketStateKey.HelpCategoryType,
      SupportTicketStateKey.HelpSubCategoryType,
      SupportTicketStateKey.Message,
    ];
    if (isUsernameRequired) {
      fields.push(SupportTicketStateKey.Username);
    }
    return fields;
  }, [isUsernameRequired]);

  // Sync username validation state via manual focus/blur trigger with username modal and submit ready state (e.g. submit button enablement)
  // TODO(mhowell): Confirm with Melissa if we want to show invalid username modal once or multiple times on change + blur
  const {
    validateUsername,
    isLoading: isUsernameValidationLoading,
    isUsernameValid,
  } = useValidateUsername();

  const currentUsernameInput = supportFormData[SupportTicketStateKey.Username];

  useEffect(() => {
    // call it when the username input changes, should be debounced
    validateUsername(currentUsernameInput);
  }, [validateUsername, currentUsernameInput]);

  // Unwrap support form data and merge with selected items
  const unwrappedSupportFormData = useMemo(() => {
    return {
      ...supportFormData,
      deviceType: selectedItems.deviceType?.val ?? supportFormData.deviceType,
      helpCategoryType: selectedItems.helpCategoryType?.val ?? supportFormData.helpCategoryType,
      helpSubCategoryType:
        selectedItems.helpSubCategoryType?.val ?? supportFormData.helpSubCategoryType,
    };
  }, [supportFormData, selectedItems]);

  const { username, firstName, email, confirmEmail, message, assetId, universeId } =
    unwrappedSupportFormData;

  // list of keys that have been touched
  const [dirty, setDirty] = useState<Partial<Record<SupportTicketStateKey, boolean>>>({});

  const formErrors = useMemo(() => {
    const errors = getFormFieldErrors(unwrappedSupportFormData, t);
    if (!isUsernameValid && supportFormData.username !== "") {
      errors.username = t("Response.InvalidUsername");
    }

    // filter out non-dirty fields
    return Object.keys(errors).reduce(
      (acc, key) => {
        if (dirty[key as SupportTicketStateKey]) {
          acc[key as SupportTicketStateKey] = errors[key as SupportTicketStateKey]!;
        }
        return acc;
      },
      {} as Record<SupportTicketStateKey, string>,
    );
  }, [unwrappedSupportFormData, t, isUsernameValid, supportFormData.username, dirty]);

  // Ensure age gate syncs from context store anytime it changes with local form state
  const ageCategory = ageGateTag || AgeGateDOBGroupLabel.Age13AndOver;

  // Triggers when any selectable dropdown changes
  const updateSupportTicketFormSelectable = (item: Item, id: string) => {
    setSelectedItems(prevSelectedItems => {
      // If the main category changes, reset the subcategory selection
      if (id === SupportTicketStateKey.HelpCategoryType) {
        return {
          ...prevSelectedItems,
          [id]: item,
          [SupportTicketStateKey.HelpSubCategoryType]: null,
        };
      }
      return {
        ...prevSelectedItems,
        [id]: item,
      };
    });
  };

  // Triggers when any text field changes
  const updateSupportTicketFormTextInput = (id: SupportTicketStateKey, content: string) => {
    setSupportFormData(prevSupportFormData => ({
      ...prevSupportFormData,
      [id]: content,
    }));
  };

  // Triggered when field loses focus
  const handleBlur = useCallback(
    (id: keyof SupportFormState) => {
      setDirty(prevDirty => ({ ...prevDirty, [id]: true }));

      // Validate username and show invalid username disclaimer if invalid when field loses focus
      if (id === SupportTicketStateKey.Username) {
        // if we have a username and it is not empty, we want to try to validate it in the backend
        // otherwise, no need, we can just show the error
        if (supportFormData.username?.length) {
          validateUsername(supportFormData.username);
        }
      }
    },
    [supportFormData.username, validateUsername],
  );

  // Custom hook with useMutation for submitting support form data with relevant response data and error states
  const {
    submitSupportForm,
    isLoading: isSubmissionLoading,
    reset: resetSubmitRequest,
  } = useSubmitSupportForm();

  // Clear all support form state
  const resetFormState = useCallback(() => {
    updateSupportInquiryContext({ [SupportTicketStateKey.SubmittedSupportFormData]: undefined });
    setSupportFormData(defaultTicketFormFields());
    setSelectedItems(defaultTicketFormSelectables());
    resetSubmitRequest();
    resetVerification(); // Clear OTP session token and verification state
  }, [updateSupportInquiryContext, resetSubmitRequest, resetVerification]);

  const { confirm, modal: confirmModal } = useConfirmDialog(t);

  const buildSentryCaptureContext = useCallback(
    (supportError: string): Record<string, string> => {
      return {
        support_error: supportError,
        support_help_category:
          selectedItems[SupportTicketStateKey.HelpCategoryType]?.val ?? "unknown",
        support_help_subcategory:
          selectedItems[SupportTicketStateKey.HelpSubCategoryType]?.val ?? "unknown",
        support_device_type: selectedItems[SupportTicketStateKey.DeviceType]?.val ?? "unknown",
        support_username: supportFormData.username ?? "empty",
        is_user_authenticated: authenticatedUser.isAuthenticated.toString(),
      };
    },
    [selectedItems, supportFormData.username],
  );

  // Render modal errors from server error response
  const showErrorDialog = useCallback(
    (params?: {
      message?: string;
      callback?: () => void;
      captureContext?: Record<string, string>;
    }) => {
      // Warn if Sentry isn't loaded on the page — captureException is a silent
      // no-op in that case, so nothing will be reported.
      if (!window.Sentry) {
        console.warn(
          "[SupportForm] Sentry is not initialized (no global client) — error will NOT be reported to Sentry.",
        );
      }

      // Capture error to Sentry via the global client populated by the `sentry`
      // component (matches the house pattern used by other teams).
      const supportError = new Error(
        `Support form error: ${params?.message ?? "Unknown error occurred"}`,
      );
      supportError.name = "SupportFormError";
      window.Sentry?.captureException(supportError, {
        tags: {
          component: "SupportForm",
        },
        // Context fields (username, category, etc.) go in `extra`, not `tags`:
        // tags are indexed for filtering and must stay low-cardinality / PII-free.
        extra: {
          ...(params?.captureContext ?? {}),
        },
      });

      return confirm({
        headerText: t("Heading.Dialog.ErrorWithoutContext"),
        bodyText: params?.message || t("Response.Dialog.ErrorWithoutContext"),
        onOk: () => {
          params?.callback?.();
          resetFormState();
        },
        topIcon: <FaceFrownIcon width={50} height={50} />,
      });
    },
    [confirm, resetFormState, t],
  );

  const showSuccessDialog = useCallback(
    () =>
      confirm({
        headerText: t("Heading.Dialog.RequestReceived"),
        bodyText: t("Response.Dialog.RequestReceived"),
        topIcon: <FaceSmileIcon width={50} height={50} />,
        onOk: () => {
          setDirty({});
          resetFormState();
        },
      }),
    [confirm, t, resetFormState, setDirty],
  );

  // Show error dialog when sending verification code fails
  useEffect(() => {
    if (sendCodeError) {
      showErrorDialog({
        message: sendCodeError,
        captureContext: buildSentryCaptureContext("email_verification_send_code"),
      }).catch(() => {
        // Error dialog closed or failed
      });
    }
  }, [sendCodeError, showErrorDialog, buildSentryCaptureContext]);
  // we want to disable the submit button if the form is incomplete or has errors or if the username is invalid
  const isFormDataValidToSubmit = useMemo(() => {
    const requiredFieldsValid = requiredFields.every(
      field =>
        !formErrors[field] &&
        unwrappedSupportFormData[field] != null &&
        String(unwrappedSupportFormData[field]).trim() !== "",
    );

    // Also check if username is invalid (if username is provided)
    const hasUsername = username && username.trim() !== "";
    const isUsernameValidForSubmit = !hasUsername || isUsernameValid;

    // If universe ID field is shown, ensure it has no errors as well
    const isUniverseIdValidForSubmit =
      !showUniverseIdField || !formErrors[SupportTicketStateKey.UniverseId];

    return requiredFieldsValid && isUsernameValidForSubmit && isUniverseIdValidForSubmit;
  }, [
    requiredFields,
    username,
    isUsernameValid,
    showUniverseIdField,
    formErrors,
    unwrappedSupportFormData,
  ]);

  // Render inline validation errors modal if they exist (e.g. invalid username needs confirmation via modal before submit)
  const confirmWarning = useCallback(async () => {
    let modalConfig: MessageModalConfig | undefined;

    // When the selected category requires a username, submission is already
    // blocked by inline validation, so we don't need the empty-username
    // confirmation modal.
    if (!unwrappedSupportFormData[SupportTicketStateKey.Username] && !isUsernameRequired) {
      modalConfig = {
        headerText: t("Heading.Dialog.UsernameEmpty"),
        bodyText: t("Response.Dialog.WarningUsernameEmpty"),
        cancelText: t("Action.Dialog.Cancel"),
        okText: t("Action.Continue"),
        dataTestId: "username-empty-warning-modal",
      };
    } else if (unwrappedSupportFormData[SupportTicketStateKey.Username] && !isUsernameValid) {
      modalConfig = {
        headerText: t("Heading.Dialog.InvalidUsername"),
        bodyText: t("Response.Dialog.InvalidUsernamePresubmit"),
        cancelText: t("Action.Dialog.Cancel"),
        okText: t("Action.Continue"),
      };
    }
    if (modalConfig) {
      return confirm(modalConfig);
    }
    // If no modal is needed, return true
    return true;
  }, [t, confirm, isUsernameValid, isUsernameRequired, unwrappedSupportFormData]);

  // Support Form submission: custom hook with useMutation and handle for submitting ticket if fields are valid otherwise surfaces error (inline or via modal depending on error)
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      // Ensure <form /> submission does not reload page
      e.preventDefault();

      // Fire beacon events related to article suggestions if the user has viewed the article
      dispatchTelemetryEvent(
        userViewedHelpArticleRef.current
          ? EventName.SupportSubmitAfterReadArticle
          : EventName.SupportSubmitWithoutReadArticle,
        ticketSupportArticleEventType,
        {},
      );

      // set all dirty using SupportTicketStateKey
      setDirty(
        Object.keys(SupportTicketStateKey).reduce(
          (acc, key) => ({
            ...acc,
            [SupportTicketStateKey[key as keyof typeof SupportTicketStateKey]]: true,
          }),
          {},
        ),
      );

      if (!isFormDataValidToSubmit) {
        return;
      }

      // Check if email verification is required and not yet verified
      if (metadata?.isEmailVerificationRequired && !isCodeVerified) {
        await verifyEmail(email ?? "");
        return;
      }

      if (!(await confirmWarning())) {
        resetSubmitRequest();
        return;
      }
      updateSupportInquiryContext({
        [SupportTicketStateKey.SubmittedSupportFormData]: unwrappedSupportFormData,
      });
      try {
        const submitData: GenericResponse = await submitSupportForm({
          url: metadata?.submitFormUrl ?? "",
          formData: toSupportTicketRequestModel(
            unwrappedSupportFormData,
            "", // captchaId
            "", // captchaToken
            helpCenterArticleId,
            helpCenterArticleLang,
            ageCategory,
            otpSessionToken || undefined,
          ),
        });

        if (metadata?.isRobloxEmployee) {
          window.__ROBLOX_DEBUG_SUPPORT_FORM__ = { conversationId: submitData?.conversationId };
        }

        const outofBandSupport =
          submitData?.supportedReceived === SupportedReceivedValues.StandardTicket ||
          submitData?.supportedReceived === SupportedReceivedValues.SierraU13Email;
        if (submitData?.success && outofBandSupport) {
          // a ticket was filed, show success dialog
          await showSuccessDialog();
          return;
        }

        // ------------ C3 chatbot eligibility transition ------------
        const isUserC3ChatbotEligble =
          submitData?.success && submitData?.supportedReceived === SupportedReceivedValues.C3Chat;

        if (isUserC3ChatbotEligble) {
          pushSegment(AppRoute.SupportChatC3);
          return;
        }

        // ------------ Sierra chatbot eligibility transition ------------
        const isUserSierraChatbotEligible =
          submitData?.success &&
          submitData?.supportedReceived === SupportedReceivedValues.SierraChat;
        if (isUserSierraChatbotEligible) {
          // Clean up any past convo context on this tab as we are proceeding with a separate support form submission
          clearSierraChatSession();
          pushSegment(AppRoute.SupportChatSierra);
          return;
        }

        if (submitData?.supportedReceived === SupportedReceivedValues.Throttled) {
          await showErrorDialog({
            message: t("Response.Dialog.Throttled"),
            captureContext: buildSentryCaptureContext("submission_throttled"),
          });
          return;
        }

        if (submitData?.supportedReceived === SupportedReceivedValues.Error) {
          await showErrorDialog({
            message: t("Response.Dialog.ErrorWithoutContext"),
            captureContext: buildSentryCaptureContext("submission_server_error"),
          });
          return;
        }

        userViewedHelpArticleRef.current = false;
        await showSuccessDialog();
      } catch (submitError) {
        const serverErrorMessage =
          submitError instanceof Error
            ? submitError.message
            : t("Response.Dialog.ErrorWithoutContext");

        if (serverErrorMessage.includes("Kind: abandoned; Type: captcha;")) {
          // don't show an error dialog, the user abandoned the captcha
          return;
        }

        const shouldDefaultToGenericMessage = !serverErrorMessage;
        const userFacingErrorMessage = shouldDefaultToGenericMessage
          ? t("Response.Dialog.ErrorWithoutContext")
          : serverErrorMessage;

        await showErrorDialog({
          message: userFacingErrorMessage,
          captureContext: buildSentryCaptureContext("submission_exception"),
        });
      }
    },
    [
      isFormDataValidToSubmit,
      confirmWarning,
      updateSupportInquiryContext,
      unwrappedSupportFormData,
      resetSubmitRequest,
      submitSupportForm,
      metadata?.submitFormUrl,
      metadata?.isEmailVerificationRequired,
      helpCenterArticleId,
      helpCenterArticleLang,
      ageCategory,
      showSuccessDialog,
      pushSegment,
      showErrorDialog,
      t,
      isCodeVerified,
      verifyEmail,
      email,
    ],
  );

  if (isLoadingGuacConfig) {
    return (
      <span role="progressbar" aria-label="Loading content" className="spinner spinner-default" />
    );
  }

  const hcArticleClickHandler = () => {
    if (!userViewedHelpArticleRef?.current) {
      dispatchTelemetryEvent(EventName.SupportClick, ticketSupportArticleEventType, {});
    }
    if (userViewedHelpArticleRef) {
      userViewedHelpArticleRef.current = true;
    }
  };

  return (
    <div className="w-full xl:w-1/2 min-h-[110vh]" data-testid="support-form-component">
      {/* DevMode Component - only show for internal logged in users */}
      {metadata?.isRobloxEmployee && (
        <DevModeComponent
          setSupportFormData={setSupportFormData}
          setSelectedItems={setSelectedItems}
          setDirty={setDirty}
          selector={selector}
          currentSupportFormData={supportFormData}
          currentSelectedItems={selectedItems}
        />
      )}

      <form
        ref={formRef}
        className="rounded-lg px-6 space-y-3 h-fit w-full md:w-[650px] section-content flex-col grow"
        onSubmit={handleSubmit}
      >
        {/* CONTACT INFORMATION */}
        <h2 className="block">{t("Heading.ContactInformation")}</h2>

        {/* Username */}
        <div className="space-y-1">
          <label htmlFor={SupportTicketStateKey.Username} className="block font-bold">
            {t("Label.Username")}
            {!isUsernameRequired && (
              <span className="font-normal"> {t("Label.OptionalWithParentheses")}</span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              autoComplete="off"
              maxLength={defaultMaxInputFieldLength}
              name={SupportTicketStateKey.Username}
              id={SupportTicketStateKey.Username}
              required={isUsernameRequired}
              aria-required={isUsernameRequired}
              className={classNames("w-full px-3 py-2 form-control input-field", {
                "ring-red-500 ring-1": !!formErrors[SupportTicketStateKey.Username],
              })}
              placeholder={t("Label.Username")}
              value={username}
              onBlur={() => {
                handleBlur(SupportTicketStateKey.Username);
              }}
              onChange={e => {
                updateSupportTicketFormTextInput(SupportTicketStateKey.Username, e.target.value);
              }}
            />
          </div>
          {formErrors[SupportTicketStateKey.Username] && (
            <span className="text-red-500 text-sm">
              {formErrors[SupportTicketStateKey.Username]}
            </span>
          )}
        </div>

        {/* First Name */}
        <div className="space-y-1">
          <label htmlFor={SupportTicketStateKey.FirstName} className="block font-bold">
            {t("Label.FirstName")}
            <span className="font-normal"> {t("Label.OptionalWithParentheses")}</span>
          </label>
          <input
            type="text"
            name={SupportTicketStateKey.FirstName}
            id={SupportTicketStateKey.FirstName}
            autoComplete="off"
            maxLength={defaultMaxInputFieldLength}
            placeholder={t("Label.FirstName")}
            className="w-full px-3 py-2 form-control input-field"
            value={firstName}
            onBlur={() => {
              handleBlur(SupportTicketStateKey.FirstName);
            }}
            onChange={e => {
              updateSupportTicketFormTextInput(SupportTicketStateKey.FirstName, e.target.value);
            }}
          />
          <span
            hidden={!formErrors[SupportTicketStateKey.FirstName]}
            className="text-red-500 text-sm"
          >
            {formErrors[SupportTicketStateKey.FirstName]}
          </span>
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label htmlFor={SupportTicketStateKey.Email} className="block font-bold">
            {ageCategory === AgeGateDOBGroupLabel.Age13AndOver
              ? t("Label.EmailAddress")
              : t("Label.ParentEmailAddress")}
          </label>
          <input
            id={SupportTicketStateKey.Email}
            name={SupportTicketStateKey.Email}
            type="email"
            placeholder={
              ageCategory === AgeGateDOBGroupLabel.Age13AndOver
                ? t("Label.EmailAddress")
                : t("Label.ParentEmailAddress")
            }
            value={email}
            className={classNames("w-full px-3 py-2 form-control input-field", {
              "ring-red-500 ring-1": !!formErrors[SupportTicketStateKey.Email],
            })}
            onBlur={() => {
              handleBlur(SupportTicketStateKey.Email);
            }}
            onChange={e => {
              updateSupportTicketFormTextInput(SupportTicketStateKey.Email, e.target.value);
            }}
          />
          <span hidden={!formErrors[SupportTicketStateKey.Email]} className="text-red-500 text-sm">
            {formErrors[SupportTicketStateKey.Email]}
          </span>
        </div>

        {/* Confirm Email */}
        <div className="space-y-1">
          <label htmlFor={SupportTicketStateKey.ConfirmEmail} className="block font-bold">
            {t("Label.ConfirmEmail")}
          </label>
          <input
            id={SupportTicketStateKey.ConfirmEmail}
            name={SupportTicketStateKey.ConfirmEmail}
            type="email"
            placeholder={t("Label.ConfirmEmail")}
            className={classNames("w-full px-3 py-2 form-control input-field", {
              "ring-red-500 ring-1": !!formErrors[SupportTicketStateKey.ConfirmEmail],
            })}
            value={confirmEmail}
            onBlur={() => {
              handleBlur(SupportTicketStateKey.ConfirmEmail);
            }}
            onChange={e => {
              updateSupportTicketFormTextInput(SupportTicketStateKey.ConfirmEmail, e.target.value);
            }}
          />
          <span
            hidden={!formErrors[SupportTicketStateKey.ConfirmEmail]}
            className="text-red-500 text-sm"
          >
            {formErrors[SupportTicketStateKey.ConfirmEmail]}
          </span>
        </div>

        {/* ISSUE DETAILS */}
        <h2 className="block pb-1 pt-2">{t("Heading.IssueDetails")}</h2>

        {/* Device Type */}
        <div className="space-y-1">
          {deviceTypeSelectable && (
            <Fragment>
              <label htmlFor={SupportTicketStateKey.DeviceType} className="block font-bold">
                {t("Heading.DeviceWithProblem")}
              </label>
              <DropdownMenu
                id={deviceTypeSelectable.key}
                items={deviceTypeSelectable.items}
                label={deviceTypeSelectable.label}
                errorMessage={formErrors[SupportTicketStateKey.DeviceType]}
                selectedItem={deviceTypeSelectable.items.find(
                  item => item.id === selectedItems[SupportTicketStateKey.DeviceType]?.id,
                )}
                setSelectedItem={updateSupportTicketFormSelectable}
              />
            </Fragment>
          )}
        </div>

        {/* Help Category Type */}
        <div className="space-y-1">
          {helpCatTypeSelectable && (
            <Fragment>
              <label htmlFor={SupportTicketStateKey.DeviceType} className="block font-bold">
                {t("Heading.HelpCategoryType")}
              </label>
              <DropdownMenu
                id={helpCatTypeSelectable.key}
                items={helpCatTypeSelectable.items}
                label={helpCatTypeSelectable.label}
                errorMessage={formErrors[SupportTicketStateKey.HelpCategoryType]}
                selectedItem={helpCatTypeSelectable.items.find(
                  item => item.id === selectedItems[SupportTicketStateKey.HelpCategoryType]?.id,
                )}
                setSelectedItem={updateSupportTicketFormSelectable}
              />
            </Fragment>
          )}

          {/* Help Subcategory Type */}
          {helpSubCatTypeSelectable && helpSubCatTypeSelectable.items.length > 0 && (
            <DropdownMenu
              id={helpSubCatTypeSelectable.key}
              items={helpSubCatTypeSelectable.items}
              label={helpSubCatTypeSelectable.label}
              errorMessage={formErrors[SupportTicketStateKey.HelpSubCategoryType]}
              selectedItem={helpSubCatTypeSelectable.items.find(
                item => item.id === selectedItems[SupportTicketStateKey.HelpSubCategoryType]?.id,
              )}
              setSelectedItem={updateSupportTicketFormSelectable}
            />
          )}
        </div>

        {/* Help articles suggestions */}
        <ArticleSuggestions
          helpSubCategoryType={selectedItems[SupportTicketStateKey.HelpSubCategoryType]?.id}
          hcArticleClickHandler={hcArticleClickHandler}
        />

        {/* Asset ID Field if appealing content */}
        <div className="space-y-1" hidden={!showAssetIdField}>
          <label htmlFor={SupportTicketStateKey.AssetId} className="block font-bold">
            {t("Label.AssetID")}
          </label>
          <input
            id={SupportTicketStateKey.AssetId}
            name={SupportTicketStateKey.AssetId}
            type="number"
            placeholder={t("Label.AssetID")}
            className={classNames("w-full px-3 py-2 form-control input-field", {
              "ring-red-500 ring-1": !!formErrors[SupportTicketStateKey.AssetId],
            })}
            value={assetId}
            onChange={e => {
              updateSupportTicketFormTextInput(SupportTicketStateKey.AssetId, e.target.value);
            }}
            onBlur={() => {
              handleBlur(SupportTicketStateKey.AssetId);
            }}
          />
          <span
            hidden={!formErrors[SupportTicketStateKey.AssetId]}
            className="text-red-500 text-sm"
          >
            {formErrors[SupportTicketStateKey.AssetId]}
          </span>
        </div>

        {/* Universe ID Field if appealing content */}
        <div className="space-y-1" hidden={!showUniverseIdField}>
          <label htmlFor={SupportTicketStateKey.UniverseId} className="block font-bold">
            {t("Label.UniverseID")}
          </label>
          <input
            id={SupportTicketStateKey.UniverseId}
            name={SupportTicketStateKey.UniverseId}
            type="text"
            placeholder={t("Label.UniverseID")}
            className={classNames("w-full px-3 py-2 form-control input-field", {
              "ring-red-500 ring-1": !!formErrors[SupportTicketStateKey.UniverseId],
            })}
            value={universeId}
            onChange={e => {
              updateSupportTicketFormTextInput(SupportTicketStateKey.UniverseId, e.target.value);
            }}
            onBlur={() => {
              handleBlur(SupportTicketStateKey.UniverseId);
            }}
          />
          <span
            hidden={!formErrors[SupportTicketStateKey.UniverseId]}
            className="text-red-500 text-sm"
          >
            {formErrors[SupportTicketStateKey.UniverseId]}
          </span>
        </div>

        {/* Description of Issue */}
        <div className="space-y-1">
          <label htmlFor="describeIssue" className="block font-bold">
            {t("Label.DescribeIssue")}
          </label>
          <textarea
            id="describeIssue"
            name="describeIssue"
            autoComplete="off"
            maxLength={defaultMaxIssueDescriptionFieldLength}
            rows={5}
            placeholder={t("Label.IssueDescription")}
            onBlur={() => {
              handleBlur(SupportTicketStateKey.Message);
            }}
            className={classNames(
              "w-full px-3 py-2 form-control input-field min-h-[100px] resize-y",
              {
                "ring-red-500 ring-1": !!formErrors[SupportTicketStateKey.Message],
              },
            )}
            value={message}
            onChange={e => {
              updateSupportTicketFormTextInput(SupportTicketStateKey.Message, e.target.value);
            }}
          />
          <span
            hidden={!formErrors[SupportTicketStateKey.Message]}
            className="text-red-500 text-sm"
          >
            {formErrors[SupportTicketStateKey.Message]}
          </span>
        </div>

        {/* Opt-Out Communication Checkbox */}
        {showOptOutCommunicationCheckbox ? (
          <Checkbox
            isChecked={supportFormData[SupportTicketStateKey.OptOutCommunication] === "true"}
            onCheckedChange={(isChecked: TCheckboxCheckState) => {
              updateSupportTicketFormTextInput(
                SupportTicketStateKey.OptOutCommunication,
                isChecked === true ? "true" : "false",
              );
            }}
            label={t("Label.EmailOptOutCheckbox")}
            size="Medium"
            placement="Start"
          />
        ) : null}

        {/* Ticket Submission Button */}
        <br />
        <button
          disabled={
            isUsernameValidationLoading ||
            isSubmissionLoading ||
            isSendingCode ||
            !isFormDataValidToSubmit ||
            (supportFormData.username !== "" &&
              !!dirty[SupportTicketStateKey.Username] &&
              isUsernameValid === false)
          }
          type="submit"
          className="btn-primary-lg btn-full-width my-3 py-3 h-50 "
        >
          {isUsernameValidationLoading || isSubmissionLoading || isSendingCode ? (
            <span className="spinner spinner-default" />
          ) : (
            <span className="font-semibold">{t("Action.Continue")}</span>
          )}
        </button>
        <div className="py-2 my-2" />
      </form>

      {confirmModal}

      {/* Email Verification Modal */}
      <OTPModal
        open={showEmailVerificationModal}
        onClose={closeEmailVerificationModal}
        title={t("Title.Modal.EnterCode")}
        translate={t}
      >
        <VerificationCodeModal
          code={verificationCode}
          codeError={verificationCodeError}
          isValidatingCode={isValidatingCode}
          isResendEnabled={isResendEnabled}
          timeUntilResend={timeUntilResend}
          isResending={isResending}
          onCodeChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleVerificationCodeChange(e.target.value);
          }}
          onResendCode={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleResendCode();
          }}
          translate={t}
        />
      </OTPModal>
    </div>
  );
};

export default withTranslations(UnwrappedSupportFormComponent, supportChatTranslationConfig);
