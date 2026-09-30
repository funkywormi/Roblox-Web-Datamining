import React, { useCallback, useEffect, useRef, useState } from "react";
import { CursorPager, cursorPaginationConstants } from "core-utilities";
import { createSystemFeedback } from "react-style-guide";
import { WithTranslationsProps, withTranslations } from "react-utilities";
import resellersConstants from "../constants/resellersConstants";
import {
  TAssetData,
  TEconomyMetadata,
  TResaleData,
  TResaleRecord,
  TTradePermission,
  TTradePermissions,
} from "../constants/types";
import translationConfig from "../translation.config";
import resaleService from "../services/resaleService";
import experimentationService from "../services/experimentationService";
import ResellersList from "../components/ResellersList";

export type TResellersPaneContainerProps = {
  resaleData: TResaleData;
  assetData: TAssetData;
  economyMetadata: TEconomyMetadata;
  isLimited2?: boolean;
  itemType?: string;
};

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

export const ResellersPaneContainer = ({
  resaleData,
  assetData,
  economyMetadata,
  isLimited2,
  itemType,
  translate,
}: TResellersPaneContainerProps & WithTranslationsProps): JSX.Element => {
  const [resaleRecords, setResaleRecords] = useState<TResaleRecord[]>([]);
  const [resellersLoading, setResellersLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [showResellerTradeButton, setShowResellerTradeButton] = useState(false);
  const [resellerTradePermissions, setResellerTradePermissions] = useState<TTradePermissions>({});

  // Limited 2 keys on collectibleItemInstanceId; rows without one all collide into a single entry.
  const resaleDeduplicator = useRef<Record<string, TResaleRecord>>({});
  const permissionsRef = useRef<TTradePermissions>({});

  const fetchSellerTradePermissions = useCallback(async (sellerId: number) => {
    try {
      const permissions = await resaleService.getCanTradeWith(sellerId);
      return { sellerId, permissions };
    } catch (error) {
      return { sellerId, error };
    }
  }, []);

  const batchFetchSellerTradePermissions = useCallback(
    async (sellerIds: number[]): Promise<void> => {
      if (!sellerIds.length) {
        return;
      }
      const batchSize = resellersConstants.fetchTradePermissionsBatchSize;
      const slice = sellerIds.slice(0, batchSize);
      const results = await Promise.all(slice.map(fetchSellerTradePermissions));

      const updates: TTradePermissions = {};
      results.forEach(({ sellerId, permissions, error }) => {
        updates[sellerId] = {
          isFetching: false,
          canTrade: !!permissions?.canTrade,
          error: error ?? null,
        };
      });
      permissionsRef.current = { ...permissionsRef.current, ...updates };
      setResellerTradePermissions(permissionsRef.current);

      await batchFetchSellerTradePermissions(sellerIds.slice(batchSize));
    },
    [fetchSellerTradePermissions],
  );

  const initiateFetchSellerTradePermissions = useCallback(
    async (records: TResaleRecord[]) => {
      if (!records.length) {
        return;
      }
      const sellerIds = records
        .map(resaleRecord => resaleRecord.seller?.id)
        .filter((sellerId): sellerId is number => {
          if (!sellerId || permissionsRef.current[sellerId]) {
            return false;
          }
          return true;
        });

      const queued: TTradePermissions = {};
      sellerIds.forEach(sellerId => {
        if (!permissionsRef.current[sellerId]) {
          queued[sellerId] = { isFetching: true, canTrade: false } as TTradePermission;
        }
      });
      permissionsRef.current = { ...permissionsRef.current, ...queued };
      setResellerTradePermissions(permissionsRef.current);

      await batchFetchSellerTradePermissions(sellerIds);
    },
    [batchFetchSellerTradePermissions],
  );

  const pagerRef = useRef(
    new CursorPager<TResaleRecord>(
      resellersConstants.resellersPageSize,
      resellersConstants.resellersLoadPageSize,
      pagingParameters => {
        if (!resaleData.collectibleItemId) {
          return Promise.resolve({ items: [] });
        }
        return resaleService
          .getResellersForLimited2Item(
            resaleData.collectibleItemId,
            pagingParameters.cursor,
            pagingParameters.count,
          )
          .then(resellers => ({
            nextPageCursor: resellers.nextPageCursor !== "" ? resellers.nextPageCursor : undefined,
            items: resellers.data,
          }));
      },
    ),
  );

  const resellersLoaded = useCallback(
    (records: TResaleRecord[]) => {
      setResellersLoading(false);
      const added: TResaleRecord[] = [];
      records.forEach(resaleRecord => {
        const key = String(
          isLimited2 ? resaleRecord.collectibleItemInstanceId : resaleRecord.userAssetId,
        );
        const existingRecord = resaleDeduplicator.current[key];
        if (existingRecord) {
          existingRecord.price = resaleRecord.price;
          existingRecord.seller = resaleRecord.seller;
          return;
        }
        resaleDeduplicator.current[key] = resaleRecord;
        added.push(resaleRecord);
      });
      setResaleRecords(current => [...current, ...added]);
      setCanLoadMore(pagerRef.current.canLoadNextPage);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises -- matches the Angular call, which does not await
      initiateFetchSellerTradePermissions(records);
    },
    [initiateFetchSellerTradePermissions, isLimited2],
  );

  const resellersLoadFailure = useCallback((e: { type?: string }) => {
    const { errorType } = (cursorPaginationConstants ?? {}) as {
      errorType?: Record<string, string>;
    };
    if (e?.type && e.type === errorType?.pagingParametersChanged) {
      return;
    }
    setResellersLoading(false);
  }, []);

  const loadMore = useCallback(() => {
    setResellersLoading(true);
    pagerRef.current.loadNextPage().then(resellersLoaded).catch(resellersLoadFailure);
  }, [resellersLoaded, resellersLoadFailure]);

  useEffect(() => {
    experimentationService
      .getShouldShowResellerTradeBtn()
      .then(value => {
        setShowResellerTradeButton(value ?? false);
      })
      .catch(() => {
        // Swallowed: the arm stays off.
      });

    pagerRef.current.loadFirstPage().then(resellersLoaded).catch(resellersLoadFailure);
  }, []);

  const onRecordRemoved = useCallback((resaleRecord: TResaleRecord) => {
    setResaleRecords(current => current.filter(record => record !== resaleRecord));
  }, []);

  const onTakeOffSaleFailure = useCallback((message: string) => {
    systemFeedbackService.warning(message, 0, resellersConstants.errorBannerTimeout);
  }, []);

  return (
    <div className="remove-panel section-content">
      <SystemFeedback />
      <div id="angular-react-purchase-handoff" data-identifier="limited-reseller-list" />
      {economyMetadata.purchasingEnabled ? (
        <React.Fragment>
          <div className="resellers">
            <ResellersList
              resaleData={resaleData}
              assetData={assetData}
              resaleRecords={resaleRecords}
              resellerTradePermissions={resellerTradePermissions}
              showResellerTradeButton={showResellerTradeButton}
              isLimited2={isLimited2}
              itemType={itemType}
              onRecordRemoved={onRecordRemoved}
              onTakeOffSaleFailure={onTakeOffSaleFailure}
            />
            {resellersLoading && <span className="spinner spinner-default" />}
          </div>
          {canLoadMore && (
            <button className="btn-control-sm see-more-resellers" type="button" onClick={loadMore}>
              {translate("Label.SeeMore")}
            </button>
          )}
          {!resellersLoading && resaleRecords.length === 0 && (
            <div className="section-content-off">{translate("Message.NoOneSelling")}</div>
          )}
        </React.Fragment>
      ) : (
        <div className="section-content-off">{translate("Message.EconomyDisabled")}</div>
      )}
    </div>
  );
};

export default withTranslations(ResellersPaneContainer, translationConfig);
