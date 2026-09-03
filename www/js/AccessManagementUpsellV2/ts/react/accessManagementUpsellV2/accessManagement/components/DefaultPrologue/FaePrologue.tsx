import React, { useEffect } from 'react';
import { TranslateFunction } from 'react-utilities';
import { IModalService } from 'react-style-guide';
import { useSelector } from 'react-redux';
import useModal from '../../../hooks/useModal';
import { Recourse, UpsellStage } from '../../../enums';
import {
  setVerificationStageRecourse,
  selectFeatureName,
  setStage,
  selectFeatureAccess
} from '../../accessManagementSlice';
import { useAppDispatch } from '../../../store';
import { PrologueConstants } from '../../constants/viewConstants';
import {
  getPrologueTranslatedBodyText,
  getPrologueTranslatedTitle
} from '../../constants/prologueSettings';
import {
  sendInitialUpsellPageLoadEvent,
  sendVerifyCancelClickEvent
} from '../../constants/eventConstants';

const FaePrologue = ({
  translate,
  onHide,
  recourseParameters,
  source
}: {
  translate: TranslateFunction;
  onHide: () => void;
  recourseParameters: Record<string, string> | null;
  source?: string;
}): [JSX.Element, IModalService] => {
  const dispatch = useAppDispatch();
  const featureName = useSelector(selectFeatureName);
  const featureAccess = useSelector(selectFeatureAccess);
  const recourseResponses = featureAccess.data.recourses;

  // TODO: This should be renamed if there are other things besides settings that FAE serves as a recourse for.
  const settingName = recourseParameters ? Object.keys(recourseParameters)[0] : undefined;

  const defaultBodyText = PrologueConstants.Description.Fae;

  const translatedBodyText = getPrologueTranslatedBodyText(
    featureName,
    defaultBodyText,
    translate,
    [Recourse.AgeEstimation],
    recourseParameters
  );

  const body = (
    <div className='text-description' dangerouslySetInnerHTML={{ __html: translatedBodyText }} />
  );

  const defaultTitle = PrologueConstants.Title.CheckYourAge;
  const translatedTitle = getPrologueTranslatedTitle(featureName, defaultTitle, translate);

  const actionButtonTranslateKey = PrologueConstants.Action.Continue;
  const neutralButtonTranslateKey = PrologueConstants.Action.Cancel;

  const [requireFaeModal, requireFaeModalService] = useModal({
    translate,
    title: translatedTitle,
    body,
    actionButtonTranslateKey,
    neutralButtonTranslateKey,
    onAction: () => {
      // TODO: Add event tracking
      dispatch(setVerificationStageRecourse(recourseResponses[0]));
      dispatch(setStage(UpsellStage.Verification));
      requireFaeModalService.close();
    },
    size: 'sm',
    onHide: () => {
      sendVerifyCancelClickEvent(featureName, 'Fae', settingName, recourseParameters, source);
      onHide();
    },
    onNeutral: () => {
      sendVerifyCancelClickEvent(featureName, 'Fae', settingName, recourseParameters, source);
      onHide();
    }
  });

  useEffect(() => {
    requireFaeModalService.open();
    sendInitialUpsellPageLoadEvent(featureName, 'Fae', settingName, recourseParameters, source);
  }, []);

  return [requireFaeModal, requireFaeModalService];
};

export default FaePrologue;
