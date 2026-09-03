import { authenticatedUser } from 'header-scripts';
import PropTypes from 'prop-types';
import React, { useState, Fragment } from 'react';
import { IconButton, Tooltip } from 'react-style-guide';
import { MediaType } from '../../../../ts';
import { getUserConfiguration } from '../services/transactionsDataService';
import getParentInfo from '../services/parentalControlsService';
import DateRangeModal from './DateRangeModal';
import VerificationModal from './VerificationModal';
import LinkParentModal from './LinkParentModal';

function TransactionsDownloadComponent({
  translate,
  systemFeedbackService,
  targetId,
  targetType,
  transactionType
}) {
  const { id: userId, isUnder13 } = authenticatedUser;
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showLinkParentModal, setShowLinkParentModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleClick = async () => {
    getUserConfiguration(userId)
      .then(response => {
        const { data: multiFactorAuth } = response;
        const validAuthenticationMethods = multiFactorAuth.methods.filter(
          method => method.enabled && method.mediaType === MediaType.Authenticator
        );
        if (validAuthenticationMethods.length > 0) {
          if (!isUnder13) {
            setShowDownloadModal(true);
          } else {
            getParentInfo().then(({ data: parentInfo }) => {
              const isLinkedParents = parentInfo?.parents && parentInfo?.parents.length > 0;
              if (isLinkedParents) {
                setShowDownloadModal(true);
              } else {
                setShowLinkParentModal(true);
              }
            });
          }
        } else {
          setShowVerificationModal(true);
        }
      })
      .catch(errors => {
        // Note: 2SV errors do not have a userFacingMessage field
        if (errors?.length > 0) {
          systemFeedbackService.warning(translate('Message.UnknownError') || 'Unknown Error');
        }
      });
  };

  return (
    <Fragment>
      <DateRangeModal
        show={showDownloadModal}
        translate={translate}
        targetId={targetId}
        targetType={targetType}
        transactionType={transactionType}
        systemFeedbackService={systemFeedbackService}
        onClose={() => setShowDownloadModal(false)}
      />
      <VerificationModal
        show={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        translate={translate}
      />
      <LinkParentModal
        show={showLinkParentModal}
        onClose={() => setShowLinkParentModal(false)}
        translate={translate}
      />
      <div className='transactions-download-csv'>
        <Tooltip
          id='transactions-download-csv-tooltip'
          placement='bottom'
          content={translate('Label.DownloadTooltip')}>
          <IconButton
            iconName='download'
            iconType={IconButton.iconTypes.download}
            size={IconButton.sizes.medium}
            onClick={handleClick}
          />
        </Tooltip>
      </div>
    </Fragment>
  );
}

TransactionsDownloadComponent.propTypes = {
  translate: PropTypes.func.isRequired,
  targetId: PropTypes.number.isRequired,
  targetType: PropTypes.string.isRequired,
  systemFeedbackService: PropTypes.shape({
    warning: PropTypes.func.isRequired
  }).isRequired,
  transactionType: PropTypes.string.isRequired
};

export default TransactionsDownloadComponent;
