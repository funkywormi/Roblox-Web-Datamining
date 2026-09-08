import React, { useMemo, useState } from "react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { RequirementType, SettingsSection, UserSetting } from "@rbx/user-settings";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import useWrappedTranslation from "../../hooks/useWrappedTranslation";
import { resolveRatingSystem } from "../../constants/privacy/iarcAgeRatingRegistry";
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
  const { contentMaturity } = parentalControlsTranslationConstants;
  const [settingsAndOptions, isLoading, isError] = useGetSettingsAndOptionsV2();
  const setting = settingsAndOptions?.[UserSetting.iarcAgeRating];
  const currentMessageId: string | undefined = setting?.currentValue;

  const [pickedMessageId, setPickedMessageId] = useState<string>();
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
    <SettingsSection description={translate(contentMaturity.description)}>
      <div
        className="flex flex-col gap-small"
        role="group"
        aria-label={translate(contentMaturity.contentMaturityAgeRating)}
        data-testid="iarc-age-rating-page"
        data-rating-authority={ratingSystem.authority}
      >
        {ratingSystem.ratings.map(rating => {
          const requiredActions = requiredActionsByMessageId.get(rating.messageId);
          const hintKey = requiredActions && getRequirementHintKey(requiredActions);

          return (
            <IarcAgeRatingCard
              key={rating.messageId}
              entry={rating}
              isSelected={rating.messageId === selectedMessageId}
              isDisabled={
                requiredActions === undefined ||
                requiredActions.includes(RequirementType.ReadableButNotActionable)
              }
              requirementHint={hintKey && translate(hintKey)}
              onSelect={setPickedMessageId}
            />
          );
        })}
      </div>
    </SettingsSection>
  );
};

export default IarcAgeRatingPage;
