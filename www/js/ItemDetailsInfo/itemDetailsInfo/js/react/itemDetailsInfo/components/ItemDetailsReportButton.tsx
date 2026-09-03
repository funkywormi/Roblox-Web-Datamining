import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@rbx/foundation-ui';
import { AvatarAccoutrementService, CurrentUser } from 'Roblox';
import { createSystemFeedback, TSystemFeedbackService } from 'react-style-guide';
import { TranslateFunction, withTranslations, WithTranslationsProps } from 'react-utilities';
import ItemDetailsInfoService from '../services/itemDetailsInfoService';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TItemType,
  TUserItemPermissions
} from '../constants/types';
import translationConfig from '../translation.config';
import {
  getAbuseReportRevampUrl,
  loadGuacConfigNonThrowing
} from '../constants/abuseReportConstants';

const REPORT_BUTTON_CONTAINER_ID = 'item-report-button-frontend';

type TItemDetailsReportButtonProps = {
  itemDetails: TAssetItemDetails | TBundleItemDetails;
  permissions: TUserItemPermissions;
};

// Copied from the item details context menu report flow.
async function handleReportItem(
  itemId: number,
  itemType: TItemType,
  assetType: string | undefined,
  reporterId: string,
  translate: TranslateFunction,
  systemFeedbackService: TSystemFeedbackService
) {
  // Redirect to the new abuse report page if the EnableItem is true on GUAC
  const config = await loadGuacConfigNonThrowing();
  if (config.EnableItem) {
    const url = getAbuseReportRevampUrl({
      targetId: itemId.toString(),
      submitterId: CurrentUser.userId,
      abuseVector: itemType,
      custom: JSON.stringify({
        assetType
      })
    });
    window.location.replace(url);
    return;
  }

  if (itemType === 'Asset') {
    const url = `/abusereport/asset?id=${itemId}&RedirectUrl=${encodeURIComponent(
      window.location.pathname + (window.location.search || '')
    )}`;
    window.location.replace(url);
  } else {
    ItemDetailsInfoService.postSubmitSafetyEvent(itemId, reporterId)
      .then(() => {
        systemFeedbackService.success(translate('Title.ReportSubmitted'));
      })
      .catch(() => {
        systemFeedbackService.warning(translate('Title.ReportFailure'));
      });
  }
}

export const ItemDetailsReportButton = ({
  itemDetails,
  permissions,
  translate
}: TItemDetailsReportButtonProps & WithTranslationsProps): JSX.Element | null => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [SystemFeedback, systemFeedbackService] = useMemo(() => createSystemFeedback(), []);

  useEffect(() => {
    setContainer(document.getElementById(REPORT_BUTTON_CONTAINER_ID));
  }, []);

  if (!CurrentUser.isAuthenticated || !permissions.canReportItem || !container) {
    return null;
  }

  let assetType;
  if (itemDetails.itemType === 'Asset') {
    assetType = AvatarAccoutrementService.getAssetTypeById(itemDetails.assetType)?.type;
  }

  return createPortal(
    <div className='item-report-button'>
      <SystemFeedback />
      <button
        type='button'
        className='item-report-button-action'
        onClick={() =>
          handleReportItem(
            itemDetails.id,
            itemDetails.itemType,
            assetType,
            CurrentUser.userId,
            translate,
            systemFeedbackService
          )
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}>
        <Icon name={isHovered ? 'icon-filled-flag' : 'icon-regular-flag'} size='Large' />
        <span className='item-report-button-text'>{translate('Action.Report')}</span>
      </button>
    </div>,
    container
  );
};

export default withTranslations(ItemDetailsReportButton, translationConfig);
