import React, { useCallback, useState } from 'react';
import {
  Icon,
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rbx/foundation-ui';
import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';
import { useTranslation } from 'react-utilities';

export type AttachmentMenuItem = {
  // Also used as the MenuItem value and the option's test-id suffix.
  id: string;
  label: string;
  icon: TTailwindIconClass;
  // Disabled entries stay visible but greyed out.
  disabled?: boolean;
  onSelect: () => void;
};

export type PostComposerAttachmentMenuProps = {
  items: AttachmentMenuItem[];
};

// Generic (+) attachment control: a circular trigger opening a popover menu of entries. Callers
// pass in eligible entries, so new attachment types (e.g. polls) need no change here.
const PostComposerAttachmentMenu = ({ items }: PostComposerAttachmentMenuProps): JSX.Element => {
  const { translate } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback((item: AttachmentMenuItem) => {
    if (item.disabled) {
      return;
    }
    setIsOpen(false);
    item.onSelect();
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <IconButton
          data-testid='post-composer-attachment-menu-trigger'
          icon='icon-regular-plus-large'
          ariaLabel={translate('Label.AddAttachment')}
          size='Small'
          variant='Standard'
          isCircular
        />
      </PopoverTrigger>
      <PopoverContent ariaLabel={translate('Label.AddAttachment')} side='bottom' align='start'>
        <Menu size='Small'>
          <MenuSection>
            {items.map(item => (
              <MenuItem
                key={item.id}
                data-testid={`post-composer-attachment-menu-item-${item.id}`}
                value={item.id}
                title={item.label}
                leading={<Icon name={item.icon} size='Small' />}
                disabled={item.disabled}
                onSelect={() => handleSelect(item)}
              />
            ))}
          </MenuSection>
        </Menu>
      </PopoverContent>
    </Popover>
  );
};

PostComposerAttachmentMenu.displayName = 'PostComposerAttachmentMenu';

export default PostComposerAttachmentMenu;
