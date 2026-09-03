import createTransactionFailureModal from "./factories/createTransactionFailureModal";
import createInsufficientFundsModal from "./factories/createInsufficientFundsModal";
import createPriceChangedModal from "./factories/createPriceChangedModal";
import createPurchaseVerificationModal from "./factories/createPurchaseVerificationModal";
import createPurchaseConfirmationModal from "./factories/createPurchaseConfirmationModal";
import createItemPurchase from "./factories/createItemPurchase";
import itemPurchaseConstants from "./constants/itemPurchaseConstants";
import { getMetaData } from "./util/itemPurchaseUtil";
import BalanceAfterSaleText from "./components/BalanceAfterSaleText";
import PriceLabel from "./components/PriceLabel";
import AssetName from "./components/AssetName";
import PriceContainer from "./components/PriceContainer";
import TransactionVerb from "../../../ts/react/enums/TransactionVerb";
import BatchBuyPriceContainer from "./components/BatchBuyPriceContainer";
import { ASSET_TYPE_ENUM } from "../../core/services/itemPurchaseUpsellService/constants/upsellConstants";
import { startGamepassPurchaseFlow } from "../../../ts/react/flows/startGamepassPurchaseFlow";

// Pure, side-effect-free assembly of the `window.RobloxItemPurchase` surface.
// The `window.RobloxItemPurchase = ...` assignment, the `ready()`/`render` DOM
// bootstrap, and the CSS side-effect imports intentionally live in the
// deployable `components/itemPurchase` entry, NOT here, so this module stays
// importable (Next / SSR, migration Step 5) without executing browser globals.
// Import paths are kept identical to the legacy
// `Roblox.Purchase.WebApp/.../itemPurchaseEntry.jsx` so the module graph — and
// therefore the emitted surface — is byte-identical.

const { errorTypeIds } = itemPurchaseConstants;

export { PriceContainer };

export default {
  createTransactionFailureModal,
  createInsufficientFundsModal,
  createPriceChangedModal,
  createPurchaseVerificationModal,
  createPurchaseConfirmationModal,
  createItemPurchase,
  errorTypeIds,
  getMetaData,
  BalanceAfterSaleText,
  PriceLabel,
  AssetName,
  TransactionVerb,
  BatchBuyPriceContainer,
  ASSET_TYPE_ENUM,
  startGamepassPurchaseFlow,
};
