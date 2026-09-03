import { TranslateFunction } from 'react-utilities';
import { PrologueConstants } from './viewConstants';
import ExpNewChildModal from '../../enums/ExpNewChildModal';
import { Recourse } from '../../enums';
import featureConstants from './featureConstants';

const titleDictionary: prologueSettingDictionary = {
  // Example
  // {AmpFeatureName}: 'PrologueSetting.Title.{AmpFeatureName}'
};

export function getPrologueTitle(featureName: string): string {
  return titleDictionary[featureName];
}

export type prologueSettingDictionary = {
  [featureName: string]: string;
};

export function getPrologueTranslatedTitle(
  featureName: string,
  defaultTitle: string,
  translate: TranslateFunction
): string {
  const featureTitle = getPrologueTitle(featureName);
  const translatedTitle = featureTitle || defaultTitle;
  return translate(translatedTitle);
}

export function getPrologueTranslatedBodyText(
  featureName: string,
  defaultText: string,
  translate: TranslateFunction,
  recourses: Recourse[],
  recourseParameters?: Record<string, string> | null,
  expChildModalType?: string
): string {
  let prologueReasonText: string = translate(defaultText);

  // IDV and VPC Prologue
  if (
    recourses.includes(Recourse.GovernmentId) &&
    recourses.includes(Recourse.ParentConsentRequest)
  ) {
    switch (featureName) {
      case featureConstants.CanCorrectAge:
        prologueReasonText = translate(PrologueConstants.Description.IdvAndVpcAgeCorrection);
        break;
      default:
        prologueReasonText = translate(defaultText);
    }
  }

  // VPC Prologue
  if (recourses.length === 1 && recourses.includes(Recourse.ParentConsentRequest)) {
    switch (true) {
      case featureName === featureConstants.TriggerTrustedFriendVPCRecourse:
        prologueReasonText = translate(PrologueConstants.Description.AddFriendVpc);
        break;
      case recourseParameters?.enablePurchases !== undefined:
        prologueReasonText = translate(PrologueConstants.Description.VpcEnablePurchase);
        break;
      case recourseParameters?.friendManagementAction === 'Unblock':
        prologueReasonText = translate(PrologueConstants.Description.VpcUnblockUser, {
          displayName: recourseParameters.displayName
        });
        break;
      case recourseParameters?.experienceManagementAction === 'Unblock':
        prologueReasonText = translate(PrologueConstants.Description.VpcUnblockExperience, {
          experienceName: recourseParameters.experienceName
        });
        break;
      case recourseParameters?.allowFacialAgeEstimation !== undefined:
        prologueReasonText = translate(PrologueConstants.Description.VpcAllowFacialAgeEstimation);
        break;
      case recourseParameters?.contentAgeRestriction !== undefined:
        prologueReasonText = translate(PrologueConstants.Description.VpcContentAgeRestriction);
        break;
      case recourseParameters?.whoCanWhisperChatWithMeInExperiences !== undefined:
        prologueReasonText = translate(
          PrologueConstants.Description.VpcWhisperChatWithMeInExperiences
        );
        break;
      case recourseParameters?.whoCanChatWithMeInExperiences !== undefined:
        prologueReasonText = translate(PrologueConstants.Description.VpcExperienceChat);
        break;
      case recourseParameters?.allowCrossAgeGroupStudioCollaboration !== undefined:
        prologueReasonText = translate(PrologueConstants.Description.VpcStudioCollaboration);
        break;
      default:
        prologueReasonText = translate(defaultText);
    }

    // If we are enrolled in the experiment, append the instructions to fetch the parent.
    if (
      expChildModalType === ExpNewChildModal.newPrologueNoVisual ||
      expChildModalType === ExpNewChildModal.newPrologueVisual
    ) {
      return `${prologueReasonText}<br /><br />${translate(
        PrologueConstants.Description.PrologueFetchParentExperiment
      )}`;
    }
  }

  // FAE Prologue
  if (recourses.length === 1 && recourses.includes(Recourse.AgeEstimation)) {
    switch (true) {
      case recourseParameters?.whoCanChatWithMeInExperiences !== undefined:
        prologueReasonText = translate(PrologueConstants.Description.FaeExperienceChat);
        break;
      case recourseParameters?.whoCanWhisperChatWithMeInExperiences !== undefined:
        prologueReasonText = translate(PrologueConstants.Description.FaeExperienceWhisperChat);
        break;
      case recourseParameters?.allowCrossAgeGroupStudioCollaboration !== undefined:
        prologueReasonText = translate(PrologueConstants.Description.FaeStudioCollaboration);
        break;
      default:
        prologueReasonText = translate(defaultText);
    }
  }

  return prologueReasonText;
}
