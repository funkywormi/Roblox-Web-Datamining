import React, { FunctionComponent, useCallback, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { AbuseReportDialog, prefetchAbuseUI } from '@rbx/abuse-report-ui';
import {
  Icon,
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rbx/foundation-ui';

export interface TransactionReportMenuProps {
  translate: TranslateFunction;
  abuseVector: string;
  reportTargetIdStr: string;
}

const TransactionReportMenu: FunctionComponent<TransactionReportMenuProps> = ({
  translate,
  abuseVector,
  reportTargetIdStr
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleMenuOpenChange = useCallback(
    (open: boolean) => {
      setIsMenuOpen(open);
      if (open && reportTargetIdStr) {
        prefetchAbuseUI({
          abuseVector,
          targetIdStr: reportTargetIdStr
        });
      }
    },
    [abuseVector, reportTargetIdStr]
  );

  const handleSelectReport = useCallback(() => {
    setIsMenuOpen(false);
    setIsReportDialogOpen(true);
  }, []);

  const handleCloseReportDialog = useCallback(() => {
    setIsReportDialogOpen(false);
  }, []);

  return (
    <div className='transaction-report-actions'>
      <span className='transaction-report-trigger'>
        <Popover open={isMenuOpen} onOpenChange={handleMenuOpenChange}>
          <PopoverTrigger asChild>
            <IconButton
              ariaLabel={translate('Label.OpenReportMenu') || 'Open report menu'}
              icon='icon-filled-three-dots-horizontal'
              size='Small'
              variant='Standard'
              isCircular
            />
          </PopoverTrigger>
          <PopoverContent
            side='bottom'
            align='end'
            ariaLabel={translate('Label.ReportMenu') || 'Report menu'}>
            <Menu size='Medium' className='transaction-report-menu'>
              <MenuSection>
                <MenuItem
                  leading={<Icon name='icon-regular-speech-bubble-exclamation' />}
                  value='report'
                  title={translate('Label.ReportTransaction') || 'Report Transaction'}
                  onSelect={handleSelectReport}
                />
              </MenuSection>
            </Menu>
          </PopoverContent>
        </Popover>
      </span>
      <AbuseReportDialog
        abuseVector={abuseVector}
        targetIdStr={reportTargetIdStr}
        open={isReportDialogOpen}
        onClose={handleCloseReportDialog}
      />
    </div>
  );
};

export default TransactionReportMenu;
