import React, { useMemo, useState } from "react";
import { authenticatedUser } from "header-scripts";
import { Button, ProgressCircle } from "@rbx/foundation-ui";
import {
  RequirementType,
  SettingsSection,
  TUpdateUserSettingValueRequest,
  TUserSettingsAndOptionsV2Body,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import {
  getAgeRatingEntry,
  resolveRatingSystem,
} from "../../constants/privacy/iarcAgeRatingRegistry";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import { useUpdateUserSettingValueV2Mutation } from "../../../apis/userSettingsApi";
import { selectSettingConsentRequirementsV2 } from "../../../apis/slices/parentalConsentSlice";
import { useAppSelector } from "../../../redux/hooks";
import {
  getRequiredActionsFromOptionsV2,
  hasParentalRequirement,
} from "../../../../core/utils/settingOptionsUtils";
import { ParentConsentType } from "../../../../types/parentConsentsTypes";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import useAutoSettingUpdate from "../../hooks/useAutoSettingUpdate";
import useGetPendingParentalConsentRequest from "../../hooks/useGetPendingParentalConsentRequest";
import useCancelConsentRequestModalV2 from "../../../common/hooks/modals/useCancelConsentRequestModalV2";
import useWrappedTranslation from "../../hooks/useWrappedTranslation";
import eventService from "../../services/eventServices/eventService";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../utils/successMessageUtils";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import InformationalScreen from "../../../common/components/InformationalScreen";
import IarcAgeRatingCard from "./IarcAgeRatingCard";

const { hintText } = commonTranslationConstants;

/**
 * The step a user still has to complete before a rating is available to them.
 */
const getRequirementHintKey = (requiredActions: RequirementType[]): string | undefined => {
  const actions = new Set(requiredActions);
  if (actions.has(RequirementType.AgeCheckPending)) {
    return hintText.faePending;
  }
  if (
    actions.has(RequirementType.FacialAgeEstimation) ||
    actions.has(RequirementType.IdVerification)
  ) {
    return hintText.faeRequired;
  }
  if (
    actions.has(RequirementType.ParentalConsent) ||
    actions.has(RequirementType.ParentConsentInherited) ||
    actions.has(RequirementType.VpcForFae)
  ) {
    return hintText.vpcRequired;
  }
  return undefined;
};

export const IarcAgeRatingPage = (): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const { contentMaturity, parentalConsents } = parentalControlsTranslationConstants;
  const [settingsAndOptions, isLoading, isError] = useGetSettingsAndOptionsV2();
  const [updateSettingValue] = useUpdateUserSettingValueV2Mutation();
  const { handleAgeCheckUpsells, errorModal } = useAgeVerificationUpsell();
  const consentRequirementsV2 = useAppSelector(
    selectSettingConsentRequirementsV2(authenticatedUser.id!),
  );
  const setting = settingsAndOptions?.[UserSetting.iarcAgeRating];
  const currentMessageId: string | undefined = setting?.currentValue;

  // Local pick + isSaving: snap back if the write does not land, and block overlapping clicks. ACCMAN-4740.
  const [pickedMessageId, setPickedMessageId] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const selectedMessageId = pickedMessageId ?? currentMessageId;

  const requiredActionsByMessageId = useMemo(
    () =>
      new Map<string, RequirementType[]>(
        setting?.options?.map(
          ({ option, requiredActions }) =>
            [String(option.optionValue), requiredActions ?? []] as const,
        ) ?? [],
      ),
    [setting],
  );

  const pendingConsent = useGetPendingParentalConsentRequest(
    ParentConsentType.UpdateUserSetting,
    UserSetting.iarcAgeRating,
  );
  const pendingMessageId = pendingConsent?.consentData?.[UserSetting.iarcAgeRating];
  const pendingRating = getAgeRatingEntry(pendingMessageId);

  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModalV2({ pendingConsent });

  // Which authority applies depends on the user's region, so it's derived from the values
  // the API returns rather than hardcoded.
  const ratingSystem = useMemo(
    () =>
      resolveRatingSystem(
        currentMessageId,
        setting?.options?.map(optionWithActions => optionWithActions.option.optionValue),
      ),
    [setting, currentMessageId],
  );

  const save = async (messageId: string, requiredActions?: RequirementType[]) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      setting: UserSetting.iarcAgeRating,
      value: messageId,
      usePrologue: true,
      useRequirementsMapV2: true,
      requiredActionsOverride: requiredActions,
    };

    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (!successMessageKey) {
        setPickedMessageId(undefined);
        return;
      }
      snackbarService.success(translate(successMessageKey));
    } catch (error) {
      setPickedMessageId(undefined);
      const errorKey = handleChildSettingsUpdateError(error);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  const selectRating = async (messageId: string) => {
    if (isSaving || messageId === selectedMessageId) {
      return;
    }

    const requiredActions = requiredActionsByMessageId.get(messageId);

    // Only one request per setting can be outstanding, so picking another rating that also needs a
    // parent means cancelling the first one. Offer that instead of queueing a second request.
    if (
      pendingMessageId !== undefined &&
      (messageId === pendingMessageId || hasParentalRequirement(requiredActions))
    ) {
      cancelConsentRequestModalService.open();
      return;
    }

    eventService.authButtonClickSettingsUpdateAttempt({
      setting: UserSetting.iarcAgeRating,
      value: messageId,
    });

    setPickedMessageId(messageId);
    setIsSaving(true);

    try {
      let savedAfterVerification = false;
      const startedVerification = await handleAgeCheckUpsells({
        settingName: UserSetting.iarcAgeRating,
        optionValue: messageId,
        requiredActions,
        onComplete: async (freshSettings?: TUserSettingsAndOptionsV2Body) => {
          savedAfterVerification = true;
          await save(
            messageId,
            getRequiredActionsFromOptionsV2(freshSettings?.[UserSetting.iarcAgeRating], messageId),
          );
        },
      });

      if (startedVerification) {
        if (!savedAfterVerification) {
          setPickedMessageId(undefined);
        }
        return;
      }

      await save(messageId, requiredActions);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelect = (messageId: string): void => {
    // eslint-disable-next-line no-void
    void selectRating(messageId);
  };

  // Picks the user made before being sent through the app's verification wizard come back as URL
  // params, so the rating still gets applied once they return.
  const autoUpdateModal = useAutoSettingUpdate(
    UserSetting.iarcAgeRating,
    selectRating,
    !!setting,
    consentRequirementsV2,
    translate(contentMaturity.contentMaturityAgeRating),
  );

  if (isLoading) {
    return (
      <div className="flex width-full justify-center padding-y-large">
        <ProgressCircle
          ariaLabel={translate(commonTranslationConstants.loading)}
          size="Medium"
          variant="Indeterminate"
        />
      </div>
    );
  }

  if (isError || !ratingSystem) {
    return (
      <InformationalScreen descriptionTranslationKey={commonTranslationConstants.unknownError} />
    );
  }

  return (
    <React.Fragment>
      <SettingsSection description={translate(contentMaturity.description)}>
        <React.Fragment>
          <div
            className="flex flex-col gap-small"
            role="group"
            aria-label={translate(contentMaturity.contentMaturityAgeRating)}
            data-testid="iarc-age-rating-page"
            data-rating-authority={ratingSystem.authority}
          >
            {ratingSystem.ratings.map(rating => {
              const requiredActions = requiredActionsByMessageId.get(rating.messageId);
              const isPending = rating.messageId === pendingMessageId;
              const hintKey = isPending
                ? hintText.vpcPending
                : requiredActions && getRequirementHintKey(requiredActions);

              return (
                <IarcAgeRatingCard
                  key={rating.messageId}
                  entry={rating}
                  isSelected={rating.messageId === selectedMessageId}
                  isDisabled={
                    requiredActions === undefined ||
                    requiredActions.includes(RequirementType.ReadableButNotActionable) ||
                    // The check is already running, so there is nothing to start and nothing to
                    // write until it comes back.
                    requiredActions.includes(RequirementType.AgeCheckPending)
                  }
                  requirementHint={hintKey && translate(hintKey)}
                  pendingLabel={
                    isPending ? translate(commonTranslationConstants.pending) : undefined
                  }
                  onSelect={handleSelect}
                />
              );
            })}
          </div>
          {pendingRating && (
            <div className="flex flex-col items-start gap-small margin-top-medium">
              <span className="text-body-small content-muted">
                {translate(contentMaturity.requestPending, {
                  contentMaturityLevel: pendingRating.label,
                })}
              </span>
              <Button
                variant="Standard"
                size="Medium"
                data-testid="iarc-age-rating-cancel-request"
                onClick={() => {
                  cancelConsentRequestModalService.open();
                }}
              >
                {translate(parentalConsents.cancelRequest)}
              </Button>
            </div>
          )}
        </React.Fragment>
      </SettingsSection>
      {errorModal}
      {autoUpdateModal}
      {cancelConsentRequestModal}
    </React.Fragment>
  );
};

export default IarcAgeRatingPage;
