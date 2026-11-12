import type { UpsellTranslationResource } from '../constants/serviceTypeDefinitions';
import { LANG_KEYS } from '../constants/upsellConstants';
import openDialog from './openDialog';
import { ItemPurchaseObject } from '../constants/serviceTypeDefinitions';

export default function openTryAgainLaterErrorModal(
  itemPurchaseObj: ItemPurchaseObject,
  translationResource: UpsellTranslationResource
) {
  openDialog({
    titleText: translationResource.get(LANG_KEYS.errorOccuredHeading, {}),
    bodyContent: translationResource.get(LANG_KEYS.purchaseErrorOccuredMessage, {}),
    imageUrl: itemPurchaseObj.alertImageUrl,
    acceptText: translationResource.get(LANG_KEYS.okAction, {}),
    allowHtmlContentInBody: true
  });
}
