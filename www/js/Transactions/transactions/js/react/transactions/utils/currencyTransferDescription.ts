import { Transaction, TransactionOriginType } from '../../../../ts';

export type CurrencyTransferKind = 'sent' | 'received' | 'unableToSend';

export interface CurrencyTransferDescription {
  kind: CurrencyTransferKind;
  counterPartyName?: string;
}

function counterPartyNameFromDetails(details: Transaction['details']): string | undefined {
  const raw = details.counterPartyName;
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
}

function isCurrencyTransferOrigin(transactionType: TransactionOriginType): boolean {
  return transactionType === TransactionOriginType.CurrencyTransfer;
}

function parseId(value: string | number | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Math.floor(n);
}

function idMatchesViewer(
  value: string | number | undefined,
  currentUserId: number | undefined
): boolean {
  if (currentUserId === undefined) {
    return false;
  }
  const parsed = parseId(value);
  return parsed !== null && parsed === currentUserId;
}

/**
 * Avatar headshot target from `transaction.details` for the displayed counterparty.
 */
export function getCurrencyTransferHeadshotTargetId(
  transaction: Transaction,
  kind: CurrencyTransferKind
): number | null {
  const { details } = transaction;
  if (kind === 'received') {
    return parseId(details.senderTargetId ?? details.senderUserId);
  }
  return parseId(details.receiverTargetId ?? details.recipientUserId);
}

export default function getCurrencyTransferDescription(
  transaction: Transaction,
  currentUserId?: number
): CurrencyTransferDescription | undefined {
  const { transactionType, currency, details } = transaction;

  if (!isCurrencyTransferOrigin(transactionType)) {
    return undefined;
  }

  const senderId = details.senderTargetId ?? details.senderUserId;
  const { amount } = currency;
  const counterPartyName = counterPartyNameFromDetails(details);

  if (amount < 0) {
    if (idMatchesViewer(senderId, currentUserId)) {
      return { kind: 'sent', counterPartyName };
    }
  }
  if (amount > 0) {
    if (idMatchesViewer(senderId, currentUserId)) {
      return { kind: 'unableToSend', counterPartyName };
    }
    return { kind: 'received', counterPartyName };
  }

  return undefined;
}

/**
 * Returns the transferRequestId as a string, or null if absent.
 */
export function getCurrencyTransferRequestId(transaction: Transaction): string | null {
  const id = transaction.details.transferRequestId;
  if (id === undefined || id === null) {
    return null;
  }
  return String(id);
}

/**
 * Whether this row should show the currency-transfer abuse report control (received transfer with a reportable sender).
 */
export function shouldShowCurrencyTransferReport(
  transaction: Transaction,
  currentUserId?: number
): boolean {
  const desc = getCurrencyTransferDescription(transaction, currentUserId);
  if (desc?.kind !== 'received') {
    return false;
  }
  return getCurrencyTransferHeadshotTargetId(transaction, 'received') !== null;
}
