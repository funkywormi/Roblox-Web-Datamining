import React, { useState, useEffect } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { Recourse } from '../../enums';
import { RecourseResponse } from '../../types/AmpTypes';
import RequestType from './enums/RequestType';
import userSettingsService from './services/userSettingsService';
import LoadingPage from '../../accessManagement/components/LoadingPage';
import ParentalRequestContainer from './ParentalRequestContainer';
import VpcPrologue from '../../accessManagement/components/DefaultPrologue/VpcPrologue';

// Wrapper so VpcPrologue's hooks are always called consistently within this component's lifecycle.
function FAEVpcPrologue({
  translate,
  onHide,
  recourseParameters,
  onProceed,
  source
}: {
  translate: WithTranslationsProps['translate'];
  onHide: () => void;
  recourseParameters: Record<string, string>;
  onProceed: () => void;
  source?: string;
}): JSX.Element {
  const [el] = VpcPrologue({ translate, onHide, recourseParameters, onProceed, source });
  return el;
}

// Helper container to transform the AllowFacialAgeEstimation user setting into a parental request recourse
function VPCForFAETransformContainer({
  translate,
  onHidecallback,
  value,
  isPrologueUsed,
  source
}: {
  translate: WithTranslationsProps['translate'];
  onHidecallback: () => void;
  value: Record<string, string> | null;
  isPrologueUsed: boolean;
  source?: string;
}): JSX.Element {
  const [syntheticRecourse, setSyntheticRecourse] = useState<RecourseResponse | null>(null);
  const [prologueCompleted, setPrologueCompleted] = useState(false);

  useEffect(() => {
    userSettingsService
      .getLinkedParentEmails()
      .then(response => {
        const action =
          response.parentEmails?.length > 0
            ? Recourse.ParentConsentRequest
            : Recourse.ParentLinkRequest;
        setSyntheticRecourse({
          action,
          parentConsentTypes: [RequestType.UpdateUserSetting]
        } as RecourseResponse);
      })
      .catch(() => {
        // Fallback on error: no linked parents, collect new parent email
        setSyntheticRecourse({
          action: Recourse.ParentLinkRequest,
          parentConsentTypes: [RequestType.UpdateUserSetting]
        } as RecourseResponse);
      });
  }, []);

  if (!syntheticRecourse) {
    return <LoadingPage />;
  }

  const faeValue = { ...(value || {}), allowFacialAgeEstimation: 'Enabled' };

  if (!prologueCompleted) {
    return (
      <FAEVpcPrologue
        translate={translate}
        onHide={onHidecallback}
        recourseParameters={faeValue}
        onProceed={() => setPrologueCompleted(true)}
        source={source}
      />
    );
  }

  return (
    <ParentalRequestContainer
      translate={translate}
      recourse={syntheticRecourse}
      onHidecallback={onHidecallback}
      value={faeValue}
      isPrologueUsed
      source={source}
    />
  );
}

export default VPCForFAETransformContainer;
