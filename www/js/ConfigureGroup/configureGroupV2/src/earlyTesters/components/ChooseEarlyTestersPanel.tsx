import type { FunctionComponent } from 'react';
import React from 'react';
import { Button } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupUserWithRoles } from '../../clients/groups';
import { MAX_EARLY_TESTERS } from '../../utils/constants';
import GroupMemberPickerList from './GroupMemberPickerList';
import MemberCountChip from './MemberCountChip';

const EMPTY_MEMBER_IDS: ReadonlySet<number> = new Set();

export type ChooseEarlyTestersPanelProps = {
  groupId: number;
  selection: ReadonlyMap<number, GroupUserWithRoles>;
  onToggleMember: (member: GroupUserWithRoles) => void;
  onOpenRolePicker: () => void;
};

/**
 * Shown if there's no early tester role yet. Lets the owner pick members directly to add to a
 * brand-new private role or assign an existing role instead.
 */
const ChooseEarlyTestersPanel: FunctionComponent<ChooseEarlyTestersPanelProps> = ({
  groupId,
  selection,
  onToggleMember,
  onOpenRolePicker,
}) => {
  const { translate } = useTranslation();

  return (
    <div className='gap-medium flex flex-col'>
      <div className='items-start gap-medium flex flex-row'>
        <div className='gap-xsmall grow-1 shrink-1 basis-0 flex flex-col'>
          <div className='items-center gap-small flex flex-row'>
            <span className='content-emphasis text-heading-small'>
              {translate('Heading.ChooseEarlyTesters')}
            </span>
            <MemberCountChip count={selection.size} max={MAX_EARLY_TESTERS} />
          </div>
          <span className='content-muted text-body-medium'>
            {translate('Description.ChooseEarlyTesters')}
          </span>
        </div>
        <Button variant='Standard' size='Small' className='shrink-0' onClick={onOpenRolePicker}>
          {translate('Button.ChooseRole')}
        </Button>
      </div>
      <GroupMemberPickerList
        groupId={groupId}
        existingMemberIds={EMPTY_MEMBER_IDS}
        selection={selection}
        remainingCapacity={MAX_EARLY_TESTERS}
        onToggleMember={onToggleMember}
      />
    </div>
  );
};

export default ChooseEarlyTestersPanel;
