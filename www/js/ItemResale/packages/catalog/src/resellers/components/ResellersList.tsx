import React, { useCallback, useEffect, useRef, useState } from "react";
import { numberFormat, uuidService } from "core-utilities";
import { eventTypes, sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { authenticatedUser } from "header-scripts";
import { isPremiumUser, userId } from "@rbx/core-scripts/meta/user";
import { WithTranslationsProps, withTranslations } from "react-utilities";
import resellersConstants from "../constants/resellersConstants";
import { TAssetData, TResaleData, TResaleRecord, TTradePermissions } from "../constants/types";
import translationConfig from "../translation.config";
import orderResaleRecords from "../utils/orderBy";
import resaleService from "../services/resaleService";
import ResellerRow, { getSellerId } from "./ResellerRow";

export type TResellersListProps = {
  resaleData: TResaleData;
  assetData: TAssetData;
  resaleRecords: TResaleRecord[];
  resellerTradePermissions: TTradePermissions;
  showResellerTradeButton: boolean;
  isLimited2?: boolean;
  itemType?: string;
  onRecordRemoved: (resaleRecord: TResaleRecord) => void;
  onTakeOffSaleFailure: (message: string) => void;
};

export const ResellersList = ({
  resaleData,
  assetData,
  resaleRecords,
  resellerTradePermissions,
  showResellerTradeButton,
  isLimited2,
  itemType,
  onRecordRemoved,
  onTakeOffSaleFailure,
  translate,
}: TResellersListProps & WithTranslationsProps): JSX.Element => {
  const notAvailable = translate(resellersConstants.translationKeys.notAvailable);
  const [activeUpgradeTradeBtnId, setActiveUpgradeTradeBtnId] = useState<number | null>(null);
  const [takeOffSaleDebounce, setTakeOffSaleDebounce] = useState<Record<string, boolean>>({});
  const activeUpgradeTradeBtnIdRef = useRef(activeUpgradeTradeBtnId);
  activeUpgradeTradeBtnIdRef.current = activeUpgradeTradeBtnId;

  const isPremium = useRef(isPremiumUser()).current;
  const authenticatedUserId = useRef(Number(userId())).current;

  const formatNumber = useCallback(
    (value: number | null | undefined): string | number =>
      value !== null && value !== undefined && value > 0
        ? numberFormat.getNumberFormat(value)
        : notAvailable,
    [notAvailable],
  );

  const logResellerBtnClickEvent = useCallback(
    (resaleRecord: TResaleRecord, btnStr: string) => {
      const eventParams: [string, unknown][] = [
        ["assetId", assetData.id],
        ["sellerAssetId", resaleRecord.userAssetId],
        ["sellerUserId", resaleRecord.seller.id],
        ["sellerAssetPrice", resaleRecord.price],
        ["btn", btnStr],
      ].filter(entry => entry[1] !== undefined && entry[1] !== null) as [string, unknown][];

      if (eventParams.length) {
        sendEventWithTarget(
          eventTypes.buttonClick,
          resellersConstants.eventStream.context.resellersList,
          Object.fromEntries(eventParams) as Record<string, string | number>,
        );
      }
    },
    [assetData.id],
  );

  const purchaseLimited1Item = useCallback(
    (resaleRecord: TResaleRecord) => {
      window.dispatchEvent(
        new CustomEvent(resellersConstants.purchaseEvent.name, {
          detail: {
            identifier: resellersConstants.purchaseEvent.identifier,
            name: assetData.name,
            itemType,
            assetId: assetData.id,
            productId: assetData.productId,
            assetType: assetData.type,
            expectedCurrency: 1,
            expectedPrice: resaleRecord.price,
            expectedPurchaserId: authenticatedUser.id,
            expectedPurchaserType: "User",
            expectedSellerId: getSellerId(resaleRecord),
            expectedSellerName: resaleRecord.seller.name,
            userAssetId: resaleRecord.userAssetId,
            refreshPage: true,
            resalePurchase: true,
          },
        }),
      );
      logResellerBtnClickEvent(resaleRecord, resellersConstants.eventStream.name.buyBtn);
    },
    [assetData, itemType, logResellerBtnClickEvent],
  );

  // Limited 2 sends no buttonClick, by contract with the dashboards that read it.
  const purchaseLimited2Item = useCallback(
    (resaleRecord: TResaleRecord) => {
      const uuid = uuidService.generateRandomUuid();
      window.dispatchEvent(
        new CustomEvent(resellersConstants.purchaseEvent.name, {
          detail: {
            identifier: resellersConstants.purchaseEvent.identifier,
            name: assetData.name,
            itemType,
            assetId: assetData.id,
            // Always undefined on this event; do not repoint at assetData.productId.
            productId: undefined,
            assetType: resaleData.assetType,
            collectibleItemId: resaleData.collectibleItemId,
            collectibleItemInstanceId: resaleRecord.collectibleItemInstanceId,
            collectibleProductId: resaleRecord.collectibleProductId,
            expectedCurrency: 1,
            expectedPrice: resaleRecord.price,
            expectedPurchaserId: authenticatedUser.id,
            expectedPurchaserType: "User",
            expectedSellerId: resaleRecord.seller.sellerId,
            expectedSellerName: resaleRecord.seller.name,
            expectedSellerType: resaleRecord.seller.sellerType,
            idempotencyKey: uuid,
            refreshPage: true,
            resalePurchase: true,
          },
        }),
      );
    },
    [assetData, itemType, resaleData],
  );

  const takeOffSale = useCallback(
    (resaleRecord: TResaleRecord) => {
      const failure = () => {
        onTakeOffSaleFailure(translate(resellersConstants.translationKeys.takeOffSaleFailure));
      };
      const clearDebounce = (key: string) => {
        setTakeOffSaleDebounce(current => {
          const next = { ...current };
          delete next[key];
          return next;
        });
      };

      if (!isLimited2) {
        failure();
        return;
      }

      const key = String(resaleRecord.collectibleProductId);
      setTakeOffSaleDebounce(current => ({ ...current, [key]: true }));
      resaleService
        .patchRemoveLimited2ItemFromSale(
          resaleData.collectibleItemId ?? "",
          resaleRecord,
          authenticatedUser.id as number,
        )
        .then(() => {
          clearDebounce(key);
          onRecordRemoved(resaleRecord);
        })
        .catch(() => {
          clearDebounce(key);
          failure();
        });
    },
    [assetData.id, isLimited2, onRecordRemoved, onTakeOffSaleFailure, resaleData, translate],
  );

  const onNonPremiumTradeClick = useCallback(
    (resaleRecord: TResaleRecord) => {
      if (activeUpgradeTradeBtnIdRef.current === resaleRecord.userAssetId) {
        setActiveUpgradeTradeBtnId(null);
        return;
      }
      setActiveUpgradeTradeBtnId(resaleRecord.userAssetId ?? null);
      logResellerBtnClickEvent(
        resaleRecord,
        resellersConstants.eventStream.name.nonPremiumTradeBtn,
      );
    },
    [logResellerBtnClickEvent],
  );

  useEffect(() => {
    const handler = (evt: MouseEvent) => {
      if (!activeUpgradeTradeBtnIdRef.current) {
        return;
      }
      let inTradeContainer = false;
      document.querySelectorAll(".trade-button-container").forEach(btnCont => {
        if (btnCont.contains(evt.target as Node)) {
          inTradeContainer = true;
        }
      });
      if (!inTradeContainer) {
        setActiveUpgradeTradeBtnId(null);
      }
    };
    window.addEventListener("click", handler, true);
    return () => {
      window.removeEventListener("click", handler, true);
    };
  }, []);

  return (
    <ul className="vlist">
      {orderResaleRecords(resaleRecords).map(resaleRecord => (
        <ResellerRow
          key={
            isLimited2
              ? String(resaleRecord.collectibleItemInstanceId)
              : String(resaleRecord.userAssetId)
          }
          resaleRecord={resaleRecord}
          assetData={assetData}
          resaleData={resaleData}
          isLimited2={isLimited2}
          showResellerTradeButton={showResellerTradeButton}
          isPremiumUser={isPremium}
          authenticatedUserId={authenticatedUserId}
          resellerTradePermissions={resellerTradePermissions}
          activeUpgradeTradeBtnId={activeUpgradeTradeBtnId}
          takeOffSaleDebounce={takeOffSaleDebounce}
          onBuy={isLimited2 ? purchaseLimited2Item : purchaseLimited1Item}
          onTradeClick={record => {
            logResellerBtnClickEvent(record, resellersConstants.eventStream.name.tradeBtn);
          }}
          onUpgradeClick={record => {
            logResellerBtnClickEvent(record, resellersConstants.eventStream.name.upgradeBtn);
          }}
          onNonPremiumTradeClick={onNonPremiumTradeClick}
          onTakeOffSale={takeOffSale}
          getProfilePageUrl={userId => getAbsoluteUrl(`/users/${userId}/profile`)}
          getUserTradeUrl={(userId, sellerAssetId) =>
            getAbsoluteUrl(`/users/${userId}/trade?ritems=${sellerAssetId}`)
          }
          getUpgradeToPremiumUrl={() =>
            getAbsoluteUrl("/premium/membership?ctx=trade#premium-memberships")
          }
          formatNumber={formatNumber}
          translate={translate}
        />
      ))}
    </ul>
  );
};

export default withTranslations(ResellersList, translationConfig);
