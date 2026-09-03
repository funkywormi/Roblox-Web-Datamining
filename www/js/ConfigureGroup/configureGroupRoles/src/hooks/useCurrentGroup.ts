import { useContext } from 'react';
import GroupManagementContext, {
  type GroupManagementContextValue,
} from '../providers/GroupManagementContext';

export default function useCurrentGroup(): GroupManagementContextValue {
  const ctx = useContext(GroupManagementContext);
  if (ctx === null) {
    throw new Error('useCurrentGroup must be used inside a <GroupManagementProvider>.');
  }
  return ctx;
}
