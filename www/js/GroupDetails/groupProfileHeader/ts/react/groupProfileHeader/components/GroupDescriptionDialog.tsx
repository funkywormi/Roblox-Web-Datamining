import React, { useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import { numberFormat } from 'core-utilities';
import { CloseIcon, Dialog, RobuxIcon } from '@rbx/ui';
import { SocialLinks } from '@rbx/profile-platform';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import SocialLinksComponent from './SocialLinks';

const GroupDescriptionDialogHeader: React.FC = ({ children }) => {
  return (
    <span className='group-description-dialog-body-header text-heading-small block'>
      {children}
    </span>
  );
};

const GroupDescriptionDialogContent: React.FC = ({ children }) => {
  return (
    <span className='group-description-dialog-body-content text-body-medium content-default block'>
      {children}
    </span>
  );
};

type GroupDescriptionDialogProps = {
  open: boolean;
  onClose: () => void;
  descriptionWithEscapedHtml: string;
  funds?: number;
  socialLinks?: SocialLinks;
  nameHistory?: string[];
};

const GroupDescriptionDialog: React.FC<GroupDescriptionDialogProps> = ({
  open,
  onClose,
  descriptionWithEscapedHtml,
  funds = null,
  socialLinks = null,
  nameHistory = []
}) => {
  const { translate } = useTranslation();
  const { communityProfileHeaderData } = useGroupProfileHeaderContext();
  const stringifiedNameHistory = useMemo(() => {
    return nameHistory.join('; ');
  }, [nameHistory]);

  return (
    <Dialog className='group-description-dialog' open={open} onClose={onClose} fullWidth>
      <div className='group-description-dialog-header'>
        <button type='button' className='group-description-dialog-close' onClick={onClose}>
          <CloseIcon />
        </button>
        <span className='group-description-dialog-title text-heading-small content-emphasis'>
          {communityProfileHeaderData?.name}
        </span>
      </div>
      <div className='group-description-dialog-body flex flex-col scroll gap-xxlarge padding-x-xxlarge padding-y-xlarge'>
        <div>
          <GroupDescriptionDialogHeader>{translate('Heading.About')}</GroupDescriptionDialogHeader>
          <pre
            className='group-description-dialog-body-content text-body-medium content-default'
            dangerouslySetInnerHTML={{ __html: descriptionWithEscapedHtml }}
          />
        </div>
        {funds !== null && (
          <div>
            <GroupDescriptionDialogHeader>
              {translate('Heading.Funds')}
            </GroupDescriptionDialogHeader>
            <GroupDescriptionDialogContent>
              <span className='flex items-center gap-xsmall'>
                <RobuxIcon className='content-emphasis' />
                {numberFormat.getNumberFormat(funds)}
              </span>
            </GroupDescriptionDialogContent>
          </div>
        )}
        {socialLinks && (
          <div>
            <GroupDescriptionDialogHeader>
              {translate('Heading.SocialLinksNew')}
            </GroupDescriptionDialogHeader>
            <GroupDescriptionDialogContent>
              <SocialLinksComponent socialLinks={socialLinks} />
            </GroupDescriptionDialogContent>
          </div>
        )}
        {nameHistory.length > 0 && (
          <div>
            <GroupDescriptionDialogHeader>
              {translate('Label.PreviousNames')}
            </GroupDescriptionDialogHeader>
            <GroupDescriptionDialogContent>{stringifiedNameHistory}</GroupDescriptionDialogContent>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default GroupDescriptionDialog;
