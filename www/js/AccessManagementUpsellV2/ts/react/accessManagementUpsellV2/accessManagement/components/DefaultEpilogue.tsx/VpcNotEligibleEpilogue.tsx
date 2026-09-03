import React, { useEffect } from 'react';
import { IModalService } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { useSelector } from 'react-redux';
import { EpilogueConstants } from '../../constants/viewConstants';
import useModal from '../../../hooks/useModal';
import { LearnMoreAboutAge13Link } from '../../constants/urlConstants';
import {
  sendInitialUpsellPageLoadEvent,
  sendVpcNotEligibleLearnMoreClickEvent,
  sendVpcNotEligibleModalCloseClickEvent
} from '../../constants/eventConstants';
import { selectFeatureName } from '../../accessManagementSlice';

const VpcNotEligibleEpilogue = ({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide: () => void;
}): [JSX.Element, IModalService] => {
  const featureName = useSelector(selectFeatureName);
  const translatedTitle = translate(EpilogueConstants.Title.VerifyYourAge);
  const translatedBody = (
    <div>
      <div className='text-description'>
        {translate(EpilogueConstants.Description.VpcNotEligible)}
      </div>
    </div>
  );
  const [requireVpcNotEligibleModal, requireVpcNotEligibleModalService] = useModal({
    translate,
    title: translatedTitle,
    body: translatedBody,
    actionButtonTranslateKey: EpilogueConstants.Action.LearnMore,
    onAction: () => {
      sendVpcNotEligibleLearnMoreClickEvent(featureName);
      window.open(LearnMoreAboutAge13Link, '_blank');
    },
    size: 'sm',
    onHide: () => {
      onHide();
      sendVpcNotEligibleModalCloseClickEvent(featureName);
      requireVpcNotEligibleModalService.close();
    }
  });

  useEffect(() => {
    requireVpcNotEligibleModalService.open();
    sendInitialUpsellPageLoadEvent(featureName, 'VpcNotEligible');
  }, [featureName, requireVpcNotEligibleModalService]);

  return [requireVpcNotEligibleModal, requireVpcNotEligibleModalService];
};

export default VpcNotEligibleEpilogue;
