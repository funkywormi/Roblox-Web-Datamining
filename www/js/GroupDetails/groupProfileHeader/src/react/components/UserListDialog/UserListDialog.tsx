import React, { useState, useMemo, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogBody, DialogHeroMedia } from '@rbx/foundation-ui';
import FilterSelector from './FilterSelector';
import UserList from './UserList';
import './css/_userListDialog.scss';
import { User, PaginatedResponse, FilterOption } from './types';
import { Action } from '../../../types';

export interface UserListDialogProps<TUser extends User, TFilter extends FilterOption> {
  open: boolean;
  onClose: () => void;
  title: string;
  filterOptions?: TFilter[];
  defaultFilter?: TFilter;
  filterOptionLeadingElement?: (option: TFilter) => React.ReactNode;
  filterOptionTrailingElement?: (option: TFilter) => React.ReactNode;
  queryFunction: (filter: TFilter | null, cursor?: string) => Promise<PaginatedResponse<TUser>>;
  queryKey: (filter: TFilter | null) => unknown[];
  onCtaAction?: (action: Action, userId: number) => void;
  // Optional per-user label rendered as a non-interactive Foundation `Badge`
  // (variant `Neutral`) inline after each user's displayName + verified badge, on
  // the same line. Use this to mark a user with a short status string -- e.g. an
  // "Owner" badge in groups. The string is rendered verbatim, so callers are
  // responsible for passing an already-translated value (`UserListDialog` does not
  // own a translation provider). Returning an empty string / null / undefined
  // renders nothing for that user.
  userDisplayNameTrailingLabel?: (user: TUser) => string | null | undefined;
}

const UserListDialog = <TUser extends User, TFilter extends FilterOption>({
  open,
  onClose,
  title,
  filterOptions,
  defaultFilter,
  filterOptionLeadingElement,
  filterOptionTrailingElement,
  queryFunction,
  queryKey,
  onCtaAction,
  userDisplayNameTrailingLabel
}: UserListDialogProps<TUser, TFilter>): React.ReactElement => {
  const [selectedFilter, setSelectedFilter] = useState<TFilter | null>(defaultFilter || null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const showFilter = filterOptions && filterOptions.length > 0;

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            cacheTime: 0
          }
        }
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Dialog ariaLabel={title} open={open} onOpenChange={onClose} isModal size="Large" type="Default">
        <DialogContent aria-describedby={title} className="user-list-modal-content">
          <DialogHeroMedia className="flex justify-left items-center self-stretch padding-top-xxlarge padding-left-xxlarge shrink-0">
            <div className="user-list-modal-title-bar-title">{title}</div>
          </DialogHeroMedia>
          <DialogBody className="user-list-modal-body flex flex-col items-start gap-medium self-stretch flex-1 min-height-0">
            {showFilter && (
              <FilterSelector<TFilter>
                options={filterOptions}
                optionLeadingElement={filterOptionLeadingElement}
                optionTrailingElement={filterOptionTrailingElement}
                selectedOption={selectedFilter}
                onOptionSelect={setSelectedFilter}
              />
            )}
            <div className="user-list-container" ref={scrollContainerRef}>
              <UserList<TUser, TFilter>
                selectedFilter={selectedFilter}
                open={open}
                onCloseModal={onClose}
                queryFunction={queryFunction}
                queryKey={queryKey}
                scrollContainerRef={scrollContainerRef}
                onCtaAction={onCtaAction}
                userDisplayNameTrailingLabel={userDisplayNameTrailingLabel}
              />
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </QueryClientProvider>
  );
};

export default UserListDialog;
