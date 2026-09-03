import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { Button, Divider, EditIcon, Link } from '@rbx/ui';
import CycleEndDate from './CycleEndDate';
import { MyPrivateServerType } from '../../../core/types/privateServerTypes';
import PriceDisplayInRobux from './PriceDisplayInRobux';
import { updateVipServerSubscription } from '../../../core/services/privateServerServices';
import '../../../../css/subscriptionManagement/privateServerDetails.scss';
import TogglePrivateServerSubscriptionModal from './TogglePrivateServerSubscriptionModal';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';

type PrivateServerDetailsProps = {
  privateServer: MyPrivateServerType;
  onBack?: () => void;
};

const PrivateServerDetails: React.FC<PrivateServerDetailsProps> = ({ privateServer, onBack }) => {
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedbackContext();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [renewModalOpen, setRenewModalOpen] = useState<boolean>(false);

  // These private server details can change. the rest are constant.
  // They have "State" in their name to differentiate from the privateServer fields they are based on.
  const [willRenewState, setWillRenewState] = useState<boolean>(privateServer.willRenew);
  const [priceInRobuxState, setPriceInRobuxState] = useState(privateServer.priceInRobux);
  const [expirationDateState, setExpirationDateState] = useState(privateServer.expirationDate);

  const configurePrivateServerLink = `/private-server/configure/${privateServer.privateServerId}`;
  const displayName = translate('Label.PrivateServer', { privateServerName: privateServer.name });
  const renewButtonText = willRenewState
    ? translate('Heading.Unsubscribe')
    : translate('Heading.RenewSubscription');

  const expiryDate = new Date(expirationDateState);
  // CycleEndDate component assumes it's not renewing if the renewaldate is 0
  const renewalDate = willRenewState ? expiryDate : new Date(0);

  const onClickRenewButton = useCallback(async () => {
    setSubmitting(true);
    try {
      const response = await updateVipServerSubscription(
        {
          price: priceInRobuxState ?? 0,
          active: !willRenewState
        },
        privateServer.privateServerId.toString()
      );
      systemFeedbackService.success(translate('Message.PrivateServerChanged'));
      setWillRenewState(response.active);
      setPriceInRobuxState(response.price);
      setExpirationDateState(response.expirationDate);
    } catch {
      systemFeedbackService.warning(translate('Error.GenericError'));
    } finally {
      setSubmitting(false);
      setRenewModalOpen(false);
    }
  }, [
    priceInRobuxState,
    privateServer.privateServerId,
    setSubmitting,
    setWillRenewState,
    setPriceInRobuxState,
    setExpirationDateState,
    setRenewModalOpen,
    systemFeedbackService,
    translate,
    willRenewState
  ]);

  return (
    <div>
      <div className='subscription-details-container private-server-details-container'>
        <button type='button' onClick={onBack} className='details-back-button btn-generic-back-sm'>
          <span className='icon-back' />
          {translate('Action.Back')}
        </button>
        <div className='details-info'>
          <TogglePrivateServerSubscriptionModal
            privateServer={privateServer}
            open={renewModalOpen}
            setOpen={setRenewModalOpen}
            onConfirm={onClickRenewButton}
            willRenew={willRenewState}
            submitting={submitting}
          />
          <div className='thumbnail-and-button-container'>
            <div className='detail-card-icon-container'>
              <Thumbnail2d
                targetId={privateServer.universeId}
                type={ThumbnailTypes.gameIcon}
                imgClassName='detail-icon'
                containerClass='thumbnail-detail-container'
                altName={privateServer.universeName}
              />
            </div>
            <Button
              variant='contained'
              className='subscribe-button'
              color={willRenewState ? 'secondary' : undefined}
              disabled={submitting || renewModalOpen}
              onClick={() => setRenewModalOpen(true)}>
              {renewButtonText}
            </Button>
          </div>
          <h2 className='detail-subscription-name'>{displayName}</h2>
          <Link
            href={`/games/${privateServer.placeId}`}
            underline='hover'
            className='text-description'>
            {privateServer.universeName}
          </Link>
          <PriceDisplayInRobux
            priceInRobux={priceInRobuxState}
            totalDiscountAmountInRobux={privateServer.totalDiscountAmountInRobux}
          />
          <CycleEndDate expiration={expiryDate} renewal={renewalDate} />
          <Button
            variant='text'
            component='a'
            size='small'
            startIcon={<EditIcon />}
            href={configurePrivateServerLink}
            className='configure-private-server-button'>
            {translate('Label.ConfigurePrivateServer')}
          </Button>
          <Divider className='divider' />
        </div>
      </div>
    </div>
  );
};

export default PrivateServerDetails;
