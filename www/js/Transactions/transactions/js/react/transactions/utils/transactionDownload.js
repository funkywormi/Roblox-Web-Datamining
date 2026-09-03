import { TransactionType } from '../../../../ts';

export default function getIsTransactionDownloadEnabled(transactionType, economyMetadata) {
  switch (transactionType) {
    case TransactionType.Sale:
      return economyMetadata.isTransactionsRecordsDownloadEnabled;
    case TransactionType.AffiliateSale:
      return economyMetadata.isCommissionRecordsDownloadEnabled;
    case TransactionType.LicensingPayment:
      return economyMetadata.IsIpLicenseTransactionsDownloadEnabled;
    default:
      return false;
  }
}

export { getIsTransactionDownloadEnabled };
