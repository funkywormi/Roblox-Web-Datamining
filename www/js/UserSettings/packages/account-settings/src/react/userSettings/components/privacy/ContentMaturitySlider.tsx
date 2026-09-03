import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { Button } from "react-style-guide";
import Slider from "@mui/material/Slider";
import { SliderMarkSlotProps, SliderMarkSlotPropsOverrides } from "@mui/base";
import { authenticatedUser } from "header-scripts";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { AccessManagementUpsellV2Service } from "Roblox";
import ClassNames from "classnames";
import { ContentControls, UserSetting, useSnackbar } from "@rbx/user-settings";
import useWrappedTranslation from "../../hooks/useWrappedTranslation";
import { Access } from "../../../../types/accessManagementTypes";
import { useGetFeatureAccessQuery } from "../../../apis/accessManagementApi";
import baseApi from "../../../apis/common/baseApi";
import ApiCacheTag from "../../../apis/common/cacheTagEnum";
import { ParentConsentType } from "../../../../types/parentConsentsTypes";
import ContentMaturityLevel from "../../../../enums/parentalControls/ContentMaturityLevel";
import SettingsSection from "../../../common/components/SettingsSection";
import parentalControlsConstants from "../../constants/parentalControls/parentalControlsConstants";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import useSettingsModal, {
  useSettingsInfoModal,
} from "../../../common/hooks/modals/useSettingsModal";
import parentalControlsEventService from "../../services/eventServices/parentalControlsEventService";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import useGetPendingParentalConsentRequest from "../../hooks/useGetPendingParentalConsentRequest";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import useCancelConsentRequestModal from "../../../common/hooks/modals/useCancelConsentRequestModal";
import {
  isRestrictedOptionBlockedByContentAgeVerification,
  isOptionBlockedByParentalConsent,
} from "../../utils/parentalControls/parentalConsentUtils";
import { selectSettingConsentRequirements } from "../../../apis/slices/parentalConsentSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import SettingOptionPendingPill from "../../../common/components/SettingOptionPendingPill";
import { disableBackLinkInterrupt, enableBackLinkInterrupt } from "../../utils/backLinkUtils";
import AMPFeaturesConstants from "../../constants/AMPFeaturesConstants";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../utils/successMessageUtils";
import privacyEventService from "../../services/eventServices/privacyEventService";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";

export const ContentMaturitySlider = ({ childUserId }: { childUserId?: number }): JSX.Element => {
  const settingConsentRequirements = useAppSelector(
    selectSettingConsentRequirements(childUserId ?? authenticatedUser.id!),
  );
  const dispatch = useAppDispatch();

  const { translate } = useWrappedTranslation();
  const { allowedExperience, contentMaturity } = parentalControlsTranslationConstants;
  const { snackbarService } = useSnackbar();

  const [updateUserSettingValue] = useUpdateUserSettingValueMutation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const [settingsAndOptions, settingsAndOptionsStatus] = useGetSettingsAndOptions(childUserId);
  const { data: showUnderAgeFor17PlusResult } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.ShowUnderAgeFor17PlusSettingAmpFeature,
    namespace: AMPFeaturesConstants.Namespaces.UserSettingsPolicy,
  });
  const { data: showDisallowedCountryfor17PlusResult } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.ShowDisallowedCountryFor17PlusAmpFeature,
  });

  const contentMaturityToContentControlsMap = useMemo(
    () => parentalControlsConstants.getContentMaturityToContentControlsMap(),
    [],
  );
  const contentControlsToContentMaturityMap = useMemo(
    () => parentalControlsConstants.getContentControlsToContentMaturityMap(),
    [],
  );

  const contentMaturitySliderOptions = {
    option1: {
      label: translate(contentMaturity.optionTitlesV2[ContentMaturityLevel.Minimal]),
      value: ContentMaturityLevel.Minimal,
    },
    option2: {
      label: translate(contentMaturity.optionTitlesV2[ContentMaturityLevel.Mild]),
      value: ContentMaturityLevel.Mild,
    },
    option3: {
      label: translate(contentMaturity.optionTitlesV2[ContentMaturityLevel.Moderate]),
      value: ContentMaturityLevel.Moderate,
    },
    option4: {
      label: translate(contentMaturity.optionTitlesV2[ContentMaturityLevel.Restricted]),
      value: ContentMaturityLevel.Restricted,
    },
  };
  const allSliderMarks = [
    contentMaturitySliderOptions.option1,
    contentMaturitySliderOptions.option2,
    contentMaturitySliderOptions.option3,
    contentMaturitySliderOptions.option4,
  ];
  const limitedSliderMarks = allSliderMarks.filter(
    option => option.value !== ContentMaturityLevel.Restricted,
  );

  const focusOnSelectedMark = () => {
    const timeOut = 375;
    const func = () => {
      // markActive means that slider is at or past that mark
      // Taking the last of those marks means we get the selected value
      const elements = document.getElementsByClassName("MuiSlider-markActive");
      if (elements.length > 0) {
        const element = elements[elements.length - 1] as HTMLButtonElement;
        element.focus();
      }
    };
    setTimeout(func, timeOut);
  };

  const [contentMaturityLevel, setContentMaturityLevel] = useState<ContentMaturityLevel>();
  const [displayAskParentButton, setDisplayAskParentButton] = useState(false);

  const pendingConsent = useGetPendingParentalConsentRequest(
    ParentConsentType.UpdateUserSetting,
    UserSetting.contentAgeRestriction,
  );
  const pendingConsentValue: ContentMaturityLevel | undefined = useMemo(() => {
    const contentControlValue = pendingConsent?.consentData?.[UserSetting.contentAgeRestriction];
    return contentControlValue !== undefined
      ? contentControlsToContentMaturityMap.get(contentControlValue)
      : undefined;
  }, [pendingConsent, contentControlsToContentMaturityMap]);

  const resetSelectedSliderValue = () => {
    let contentLevel: ContentMaturityLevel | undefined;
    if (settingsAndOptions?.contentAgeRestriction) {
      contentLevel = contentControlsToContentMaturityMap.get(
        settingsAndOptions.contentAgeRestriction.currentValue ?? ContentControls.AllAges,
      );
    }
    setContentMaturityLevel(contentLevel);
    setDisplayAskParentButton(false);
    disableBackLinkInterrupt();
  };

  useEffect(() => {
    if (settingsAndOptionsStatus === QueryStatus.fulfilled) {
      resetSelectedSliderValue();
    }
  }, [settingsAndOptionsStatus]);

  // ID verification
  const [errorModal, errorModalService] = useSettingsInfoModal(
    commonTranslationConstants.modal.error.title,
    commonTranslationConstants.modal.error.body,
  );
  const invalidateCachedData = () => {
    const invalidCacheTags = [
      ApiCacheTag.Birthdate,
      ApiCacheTag.AccountInfo,
      ApiCacheTag.VerifiedAge,
      ApiCacheTag.AccountInfoAgeVerificationPolicy,
    ];
    const invalidateAction = baseApi.util.invalidateTags(invalidCacheTags);
    dispatch(invalidateAction);
  };

  const [idVerificationPromptModal, idVerificationPromptModalService] = useSettingsModal({
    titleResourceId: contentMaturity.verifyYourAge,
    translatedBody: (
      <span
        dangerouslySetInnerHTML={{
          __html: translate(contentMaturity.verifyYourAgeDescriptionV2, {
            linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${allowedExperience.descriptionLink}">`,
            linkEnd: "</a>",
          }),
        }}
      />
    ),
    actionButtonTextResourceId: contentMaturity.verifyNow,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    size: "sm",
    onAction: async () => {
      privacyEventService.authButtonClickSettingsContentMaturityVerify();
      const ageVerificationFeatureParams = {
        featureName: AMPFeaturesConstants.ageVerificationAMPFeature,
      };
      try {
        await AccessManagementUpsellV2Service.startAccessManagementUpsell(
          ageVerificationFeatureParams,
        );
      } catch {
        errorModalService.open();
      } finally {
        invalidateCachedData();
        // This function will always be defined at the first render, so we ignore the eslint warning
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await updateContentMaturity(ContentMaturityLevel.Restricted);
      }
    },
    onNeutral: () => {
      privacyEventService.authButtonClickSettingsContentMaturityCancelVerify();
      resetSelectedSliderValue();
      focusOnSelectedMark();
    },
    onHide: () => {
      resetSelectedSliderValue();
      focusOnSelectedMark();
    },
  });

  // Modal for content not available
  const contentRestrictedReason: JSX.Element = useMemo(() => {
    if (showDisallowedCountryfor17PlusResult?.access === Access.Granted) {
      // Restricted content is not allowed in this country
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: translate(contentMaturity.contentRestrictedLocation, {
              linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${allowedExperience.descriptionLink}">`,
              linkEnd: "</a>",
            }),
          }}
        />
      );
    }
    if (childUserId || showUnderAgeFor17PlusResult?.access === Access.Granted) {
      // Restricted content is not allowed for under 17 users
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: translate(contentMaturity.contentAgeLimitV2, {
              linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${allowedExperience.descriptionLink}">`,
              linkEnd: "</a>",
            }),
          }}
        />
      );
    }
    return <span>{translate(commonTranslationConstants.modal.error.body)}</span>;
  }, [
    childUserId,
    contentMaturity,
    allowedExperience,
    showDisallowedCountryfor17PlusResult,
    showUnderAgeFor17PlusResult,
  ]);

  const [contentUnavailableModal, contentUnavailableModalService] = useSettingsModal({
    titleResourceId: contentMaturity.contentRestricted,
    translatedBody: contentRestrictedReason,
    actionButtonTextResourceId: commonTranslationConstants.modal.submitButtonText,
    onHide: () => {
      focusOnSelectedMark();
    },
  });

  // Modal for revoking consent request
  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModal({
      pendingConsent,
      onSuccess: () => {
        focusOnSelectedMark();
      },
    });

  const updateContentMaturity = async (value: ContentMaturityLevel) => {
    const contentAgeRestriction = contentMaturityToContentControlsMap.get(value);
    if (contentAgeRestriction === undefined) {
      // This shouldn't happen but it makes eslint happier
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
      return;
    }
    if (
      contentAgeRestriction === ContentControls.SeventeenPlus &&
      isRestrictedOptionBlockedByContentAgeVerification(settingConsentRequirements)
    ) {
      if (showDisallowedCountryfor17PlusResult?.access === Access.Granted) {
        contentUnavailableModalService.open();
        resetSelectedSliderValue();
      } else {
        // User is not age verified, prompt them with ID verification upsell before selecting 17+
        privacyEventService.authModalShownSettingsContentMaturityAgeVerify();
        idVerificationPromptModalService.open();
      }
    } else {
      try {
        parentalControlsEventService.allowedExperiencesEventsUpdated(contentAgeRestriction);
        const updateRequest = {
          childUserId,
          setting: UserSetting.contentAgeRestriction,
          value: contentAgeRestriction,
        };
        const result = await updateUserSettingValue(updateRequest).unwrap();
        const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateRequest, result);
        if (successMessageKey) {
          snackbarService.success(translate(successMessageKey));
        }
      } catch (error) {
        const errorKey = handleChildSettingsUpdateError(error, childUserId);
        if (errorKey) {
          snackbarService.warning(translate(errorKey));
        }
      }
    }
  };

  const sliderOnChangeCommittedHandler = async (
    _: Event | SyntheticEvent,
    newValue: number | number[],
  ) => {
    const selectedVal = newValue as ContentMaturityLevel;
    const contentControl = contentMaturityToContentControlsMap.get(selectedVal);
    const consentRequired = isOptionBlockedByParentalConsent(
      settingConsentRequirements,
      UserSetting.contentAgeRestriction,
      contentControl,
    );

    if (settingsAndOptions?.contentAgeRestriction) {
      const currentContentLevel = contentControlsToContentMaturityMap.get(
        settingsAndOptions.contentAgeRestriction.currentValue ?? ContentControls.AllAges,
      );

      if (currentContentLevel !== selectedVal) {
        if (pendingConsentValue && consentRequired) {
          // User already has consent request in-flight and are attempting to select an option that requires consent
          // Prompt them to revoke their consent request
          cancelConsentRequestModalService.open();
          resetSelectedSliderValue();
          return;
        }

        if (consentRequired) {
          enableBackLinkInterrupt(async () => {
            await updateContentMaturity(contentMaturityLevel ?? ContentMaturityLevel.Minimal);
          }, UserSetting.contentAgeRestriction);
        } else {
          // Consent not required for this option
          await updateContentMaturity(selectedVal);
        }
      } else {
        disableBackLinkInterrupt();
      }
      setDisplayAskParentButton(consentRequired);
    }
  };

  // This component is used for gamepad navigation
  // Making the mark a button allows it to be selectable with the gamepad
  const CustomMark = (props: SliderMarkSlotProps) => {
    const { "data-index": index, className, ownerState, ...other } = props;
    const markButtonClassName = ClassNames(className, "slider-mark-button");

    return (
      <Button
        {...other}
        className={markButtonClassName}
        onClick={() => {
          if (ownerState.marks && ownerState.marks !== true) {
            const markValue = ownerState.marks[index];
            // Create the event and trigger handlers
            const evt = new Event("click");

            if (ownerState.onChange && markValue) {
              ownerState.onChange(evt, markValue.value, markValue.value);
            }
            if (ownerState.onChangeCommitted && markValue) {
              ownerState.onChangeCommitted(evt, markValue.value);
              focusOnSelectedMark();
            }
          }
        }}
      >
        <div className="settings-slider-mark" />
      </Button>
    );
  };

  const sliderWithAllOptions = (
    <Slider
      className="settings-slider"
      classes={{ markLabel: "small text" }}
      aria-label={translate(allowedExperience.title)}
      value={contentMaturityLevel ?? 0}
      getAriaValueText={val => {
        if (val as ContentMaturityLevel) {
          return translate(contentMaturity.optionTitlesV2[val as ContentMaturityLevel]);
        }
        return "";
      }}
      step={null}
      marks={allSliderMarks}
      max={allSliderMarks.at(-1)!.value}
      onChange={(_, val) => {
        setContentMaturityLevel(val as ContentMaturityLevel);
      }}
      onChangeCommitted={sliderOnChangeCommittedHandler}
      slots={{ mark: CustomMark }}
      slotProps={{ mark: { options: allSliderMarks } as SliderMarkSlotPropsOverrides }}
    />
  );

  const sliderWithLimitedOptions = (
    <Slider
      id="limited-content-maturity-slider"
      className="settings-slider"
      classes={{ markLabel: "small text" }}
      aria-label={translate(allowedExperience.title)}
      value={contentMaturityLevel ?? 0}
      getAriaValueText={val => {
        if (val as ContentMaturityLevel) {
          return translate(contentMaturity.optionTitlesV2[val as ContentMaturityLevel]);
        }
        return "";
      }}
      step={null}
      marks={limitedSliderMarks}
      max={limitedSliderMarks.at(-1)!.value}
      onChange={(_, val) => {
        setContentMaturityLevel(val as ContentMaturityLevel);
      }}
      onChangeCommitted={sliderOnChangeCommittedHandler}
      slots={{ mark: CustomMark }}
    />
  );

  const restrictedValueSlider = (
    <Slider
      id="restricted-content-maturity-slider"
      className="settings-slider"
      classes={{ markLabel: "small text" }}
      aria-label={translate(allowedExperience.title)}
      value={0}
      getAriaValueText={_ =>
        translate(contentMaturity.optionTitlesV2[ContentMaturityLevel.Restricted])
      }
      marks={[contentMaturitySliderOptions.option4]}
      max={ContentMaturityLevel.Restricted}
      onChange={() => {
        privacyEventService.authModalShownSettingsContentMaturityContentRestricted();
        contentUnavailableModalService.open();
      }}
      slots={{ mark: CustomMark }}
    />
  );

  const restrictedOptionIsAllowed = settingsAndOptions?.contentAgeRestriction?.options.find(
    optionAndRequirement =>
      optionAndRequirement.option.optionValue === ContentControls.SeventeenPlus,
  );

  // In certain regions (e.g. Vietnam), content accessibility is determined by local age
  // ratings rather than the content maturity slider, so we show only the notice.
  if (uiPolicy?.shouldShowContentMaturityLocalAgeRatingBanner) {
    return (
      <SettingsSection>
        <div className="section-content">
          <div className="font-caption-body text">
            {translate(contentMaturity.contentMaturityAgeRating)}
          </div>
        </div>
      </SettingsSection>
    );
  }

  return (
    <React.Fragment>
      <SettingsSection
        description={
          childUserId
            ? translate(contentMaturity.parentSideDescription)
            : translate(contentMaturity.description)
        }
      >
        <React.Fragment>
          <div className="section-content content-maturity">
            <div id="content-maturity-slider-container">
              {restrictedOptionIsAllowed ? (
                sliderWithAllOptions
              ) : (
                <div>
                  {sliderWithLimitedOptions}
                  {restrictedValueSlider}
                </div>
              )}
            </div>
            <div className="content-maturity-label">
              <label className="setting-section-header" htmlFor="content-maturity-slider-container">
                {contentMaturityLevel &&
                  translate(contentMaturity.optionTitlesV2[contentMaturityLevel])}
              </label>
              {pendingConsentValue && <SettingOptionPendingPill />}
            </div>
            <div className="font-caption-body text" id="content-maturity-option-description">
              {contentMaturityLevel &&
                translate(contentMaturity.optionDescriptionsV2[contentMaturityLevel])}
            </div>

            {/* Ask parent button */}
            <div className="request-consent-button-container">
              {displayAskParentButton && !pendingConsentValue && (
                <Button
                  className="ask-parent-button"
                  variant={Button.variants.primary}
                  onClick={async () => {
                    privacyEventService.authButtonClickSettingsAskMyParent(
                      UserSetting.contentAgeRestriction,
                    );
                    await updateContentMaturity(
                      contentMaturityLevel ?? ContentMaturityLevel.Minimal,
                    );
                  }}
                >
                  {translate(parentalControlsTranslationConstants.parentalConsents.askMyParent)}
                </Button>
              )}

              {/* Cancel request button */}
              {pendingConsentValue && (
                <Button
                  className="cancel-request-button"
                  variant={Button.variants.secondary}
                  onClick={() => {
                    cancelConsentRequestModalService.open();
                  }}
                >
                  {translate(parentalControlsTranslationConstants.parentalConsents.cancelRequest)}
                </Button>
              )}
            </div>
          </div>

          {/* Pending request description */}
          {pendingConsentValue && (
            <div className="text-description">
              {translate(contentMaturity.requestPending, {
                contentMaturityLevel: translate(
                  contentMaturity.optionTitlesV2[pendingConsentValue],
                ),
              })}
            </div>
          )}
        </React.Fragment>
      </SettingsSection>
      {idVerificationPromptModal}
      {errorModal}
      {contentUnavailableModal}
      {cancelConsentRequestModal}
    </React.Fragment>
  );
};

ContentMaturitySlider.defaultProps = {
  childUserId: undefined,
};

export default ContentMaturitySlider;
