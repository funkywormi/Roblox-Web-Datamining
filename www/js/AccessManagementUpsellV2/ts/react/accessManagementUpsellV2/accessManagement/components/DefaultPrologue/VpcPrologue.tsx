import React, { useEffect } from 'react';
import { TranslateFunction } from 'react-utilities';
import { IModalService } from 'react-style-guide';
import { useSelector } from 'react-redux';
import useModal from '../../../hooks/useModal';
import { Recourse, UpsellStage } from '../../../enums';
import ExpNewChildModal from '../../../enums/ExpNewChildModal';
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
  sendEmailParentClickEvent,
  sendVerifyCancelClickEvent
} from '../../constants/eventConstants';

const VpcPrologue = ({
  translate,
  onHide,
  recourseParameters,
  expChildModalType,
  source,
  onProceed
}: {
  translate: TranslateFunction;
  onHide: () => void;
  recourseParameters: Record<string, string> | null;
  expChildModalType?: ExpNewChildModal;
  source?: string;
  onProceed?: () => void;
}): [JSX.Element, IModalService] => {
  const dispatch = useAppDispatch();
  const featureName = useSelector(selectFeatureName);

  const featureAccess = useSelector(selectFeatureAccess);
  const recourseResponses = featureAccess.data.recourses;
  const settingName = recourseParameters ? Object.keys(recourseParameters)[0] : undefined;

  const defaultBodyText = PrologueConstants.Description.Vpc;

  const translatedBodyText = getPrologueTranslatedBodyText(
    featureName,
    defaultBodyText,
    translate,
    [Recourse.ParentConsentRequest],
    recourseParameters,
    expChildModalType
  );

  const vpcPrologueBody = (
    <div>
      {expChildModalType === ExpNewChildModal.newPrologueVisual && (
        <div className='ask-your-parent-lock' />
      )}
      <div className='text-description' dangerouslySetInnerHTML={{ __html: translatedBodyText }} />
    </div>
  );

  const defaultTitle = PrologueConstants.Title.AskYourParent;
  const translatedTitle = getPrologueTranslatedTitle(featureName, defaultTitle, translate);

  const actionButtonTranslateKey = PrologueConstants.Action.AskNow;
  const neutralButtonTranslateKey = PrologueConstants.Action.Cancel;

  const [requireVpcModal, requireVpcModalService] = useModal({
    translate,
    title: translatedTitle,
    body: vpcPrologueBody,
    actionButtonTranslateKey,
    neutralButtonTranslateKey,
    onAction: () => {
      sendEmailParentClickEvent(featureName, true, settingName, recourseParameters);
      if (onProceed) {
        requireVpcModalService.close();
        onProceed();
      } else {
        dispatch(setVerificationStageRecourse(recourseResponses[0]));
        dispatch(setStage(UpsellStage.Verification));
        requireVpcModalService.close();
      }
    },
    size: 'sm',
    onHide: () => {
      sendVerifyCancelClickEvent(featureName, 'Vpc', settingName, recourseParameters, source);
      onHide();
    },
    onNeutral: () => {
      sendVerifyCancelClickEvent(featureName, 'Vpc', settingName, recourseParameters, source);
      onHide();
    }
  });

  useEffect(() => {
    requireVpcModalService.open();
    sendInitialUpsellPageLoadEvent(featureName, 'Vpc', settingName, recourseParameters, source);
  }, []);

  return [requireVpcModal, requireVpcModalService];
};

export default VpcPrologue;
