import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AuditLogEntry, AuditLogPolicies, ActionTypeFilter } from '../types';
import { getAuditLog, getUserIdFromUsername, formatDescription } from '../services/auditLogService';
import { actionTypeFilters, loadPageSize } from '../constants/auditLogConstants';

interface UseAuditLogParams {
  groupId: number;
  policies: AuditLogPolicies;
  translate: (key: string, params?: Record<string, string | number>) => string;
}

interface UseAuditLogResult {
  logs: AuditLogEntry[];
  isLoading: boolean;
  loadError: string | null;
  selectedActionType: string;
  actionTypes: ActionTypeFilter[];
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  handleSearch: (keyword: string) => void;
  handleActionTypeChange: (actionKey: string) => void;
  loadNextPage: () => void;
  loadPrevPage: () => void;
}

export const useAuditLog = ({
  groupId,
  policies,
  translate
}: UseAuditLogParams): UseAuditLogResult => {
  const [selectedActionType, setSelectedActionType] = useState('all');
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const currentCursor = cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined;
  const currentPage = cursorStack.length + 1;

  const actionTypes = useMemo<ActionTypeFilter[]>(
    () =>
      Object.entries(actionTypeFilters)
        .filter(([key]) => {
          if (!policies.displayGroupBans) {
            return key !== 'banMember' && key !== 'unbanMember';
          }
          return true;
        })
        .map(([key, translationKey]) => ({
          key,
          label: translate(translationKey)
        }))
        .sort((a, b) => {
          if (a.key === 'all') return -1;
          if (b.key === 'all') return 1;
          return a.label.localeCompare(b.label);
        }),
    [policies, translate]
  );

  const { data, isFetching, isError } = useQuery({
    queryKey: [
      'groups',
      groupId,
      'auditLog',
      { actionType: selectedActionType, userId, cursor: currentCursor }
    ],
    queryFn: () =>
      getAuditLog({
        groupId,
        actionType: selectedActionType !== 'all' ? selectedActionType : undefined,
        userId,
        cursor: currentCursor,
        limit: loadPageSize,
        sortOrder: 'Desc'
      }),
    enabled: Boolean(groupId),
    keepPreviousData: true,
    retry: false
  });

  const logs = useMemo(
    () =>
      (data?.data ?? []).map(log => ({
        ...log,
        formattedDescription: formatDescription(log, policies)
      })),
    [data, policies]
  );

  const { mutate: resolveUserId, isLoading: isResolvingUser } = useMutation({
    mutationFn: (keyword: string) => getUserIdFromUsername(keyword),
    onSuccess: foundUserId => {
      setUserId(foundUserId || undefined);
    }
  });

  const handleSearch = (keyword: string): void => {
    setCursorStack([]);
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      resolveUserId(trimmedKeyword);
    } else {
      setUserId(undefined);
    }
  };

  const handleActionTypeChange = (actionKey: string): void => {
    setSelectedActionType(actionKey);
    setCursorStack([]);
  };

  const loadNextPage = (): void => {
    if (data?.nextPageCursor) {
      setCursorStack(prev => [...prev, data.nextPageCursor as string]);
    }
  };

  const loadPrevPage = (): void => {
    setCursorStack(prev => prev.slice(0, -1));
  };

  return {
    logs,
    isLoading: isFetching || isResolvingUser,
    loadError: isError ? translate('Message.LoadTransactionsError') : null,
    selectedActionType,
    actionTypes,
    currentPage,
    hasNextPage: Boolean(data?.nextPageCursor),
    hasPrevPage: cursorStack.length > 0,
    handleSearch,
    handleActionTypeChange,
    loadNextPage,
    loadPrevPage
  };
};

export default useAuditLog;
