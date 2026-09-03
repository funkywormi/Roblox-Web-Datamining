import { Dialog, RobloxTranslationResource } from '@rbx/legacy-webapp-types/Roblox';
import { LANG_KEYS } from '../constants/upsellConstants';
import { ItemPurchaseObject } from '../constants/serviceTypeDefinitions';

export default function openTryAgainLaterErrorModal(
  itemPurchaseObj: ItemPurchaseObject,
  translationResource: RobloxTranslationResource
) {
  Dialog.open({
    titleText: translationResource.get(LANG_KEYS.errorOccuredHeading, {}),
    bodyContent: translationResource.get(LANG_KEYS.purchaseErrorOccuredMessage, {}),
    imageUrl: itemPurchaseObj.alertImageUrl,
    acceptText: translationResource.get(LANG_KEYS.okAction, {}),
    acceptColor: 'btn-secondary-md',
    declineColor: 'btn-none',
    dismissable: true,
    allowHtmlContentInBody: true
  });
}
