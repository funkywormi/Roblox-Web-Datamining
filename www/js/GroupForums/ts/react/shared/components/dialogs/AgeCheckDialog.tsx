import React, { FC, useCallback, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import {
  Dialog,
  DialogContent,
  DialogBody,
  Button,
  DialogTitle,
  DialogHeroMedia
} from '@rbx/foundation-ui';
import { useSystemFeedback } from 'react-style-guide';
import { AccessManagementUpsellV2Service } from 'Roblox';
import { groupsConfig } from '../../translation.config';
import { EventUpsellComponent } from '../../constants/eventConstants';
import groupConstants from '../../constants/groupConstants';
import CommunityEventStream, {
  getImpressionId,
  CommunityMetric,
  AgeCheckClickEvent
} from '../../utils/eventStream';
import { updateGuacNonce } from '../../utils/requestCacheBust';
import MetricsElement from '../MetricsElement';

type AgeCheckDialogProps = {
  metricContext: Partial<AgeCheckClickEvent>;
  open: boolean;
  shouldTriggerFae: boolean;
  onClose: () => void;
} & WithTranslationsProps;

const AgeCheckDialog: FC<AgeCheckDialogProps> = ({
  translate,
  open,
  onClose,
  metricContext,
  shouldTriggerFae
}) => {
  const { systemFeedbackService } = useSystemFeedback();

  const ComponentMetric = useMemo(
    () =>
      ({
        ...metricContext,
        upsellComponent: EventUpsellComponent.IntrusiveModal,
        bannerType: 'ageCheckDesc',
        upsellImpressionId: getImpressionId()
      } as AgeCheckClickEvent),
    [metricContext]
  );

  const handleCtaClick = useCallback(() => {
    if (!shouldTriggerFae) {
      CommunityEventStream.sendEvent(
        CommunityMetric.AgeCheckClick({
          ...ComponentMetric,
          clickTargetType: 'ageAssuranceUpsellAccountSettings'
        })
      );

      window.open(groupConstants.urls.accountSettings, '_blank');
      return;
    }

    const ageEstimationFeatureParams = {
      featureName: 'TriggerFacialAgeEstimationRecourse',
      namespace: 'account_identity/AgeCheck',
      isAsyncCall: false,
      featureSpecificData: {
        context: metricContext.context
      }
    };

    CommunityEventStream.sendEvent(
      CommunityMetric.AgeCheckClick({
        ...ComponentMetric,
        clickTargetType: 'ageAssuranceUpsellFaeModal'
      })
    );

    AccessManagementUpsellV2Service.startAccessManagementUpsell(ageEstimationFeatureParams)
      .catch(() => systemFeedbackService.warning(translate('NetworkError')))
      .finally(() => {
        updateGuacNonce();
        onClose();
      });
  }, [
    shouldTriggerFae,
    metricContext.context,
    ComponentMetric,
    systemFeedbackService,
    translate,
    onClose
  ]);

  const handleDismiss = useCallback(() => {
    CommunityEventStream.sendEvent(
      CommunityMetric.AgeCheckClick({
        ...ComponentMetric,
        clickTargetType: 'ageAssuranceUpsellDismiss'
      })
    );

    onClose();
  }, [ComponentMetric, onClose]);

  return (
    <Dialog
      open={open}
      onOpenChange={handleDismiss}
      isModal
      size='Small'
      type='Default'
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent className='age-check-dialog-content'>
        <DialogHeroMedia className='age-check-hero'>&nbsp;</DialogHeroMedia>
        <DialogBody className='age-check-dialog'>
          <DialogTitle className='age-check-dialog-title-bar-content'>
            {translate('Heading.CheckAgeInfo')}
          </DialogTitle>
          <MetricsElement
            isOneTimeEvent
            metric={CommunityMetric.AgeCheckBannerShown(ComponentMetric)}
          />
          <div className='age-check-dialog-text-and-cta'>
            {translate('Description.CheckAgeInfo')}
            <Button
              variant='Emphasis'
              size='Medium'
              className='age-check-cta-button size-full margin-top-medium'
              onClick={handleCtaClick}>
              {translate('Action.Continue')}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default withTranslations(AgeCheckDialog, groupsConfig);
