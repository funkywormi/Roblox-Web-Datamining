import React, { useCallback, useState } from 'react';
import { Menu, MenuSection, Popover, PopoverContent } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import '../../../../css/tailwind.css';
import { groupAnnouncementsConfig } from '../translation.config';
import DropdownMenuItem, {
  DropdownMenuCloseContext
} from '../../shared/components/DropdownMenuItem';
import MenuTrigger from '../../shared/components/MenuTrigger';
import { useAnnouncementTracking } from '../hooks/useAnnouncementTracking';

export type AnnouncementMenuProps = {
  announcementId: string;
  groupId: number;
  onDelete: () => void;
  onEdit: () => void;
  reportUrl: string;
  button: JSX.Element;
  canCreateAnnouncements?: boolean;
  canEditAnnouncement?: boolean;
} & WithTranslationsProps;

const AnnouncementMenu: React.FC<AnnouncementMenuProps> = ({
  announcementId,
  groupId,
  onDelete,
  onEdit,
  reportUrl,
  button,
  canCreateAnnouncements,
  canEditAnnouncement,
  translate
}) => {
  const { trackOverflowMenuButtonClick } = useAnnouncementTracking({ groupId });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(open => !open), []);

  const handleEdit = useCallback(() => {
    trackOverflowMenuButtonClick({ announcementId, buttonClicked: 'edit' });
    onEdit();
  }, [onEdit, trackOverflowMenuButtonClick, announcementId]);

  const handleDelete = useCallback(() => {
    trackOverflowMenuButtonClick({ announcementId, buttonClicked: 'delete' });
    onDelete();
  }, [onDelete, trackOverflowMenuButtonClick, announcementId]);

  const handleReport = useCallback(() => {
    trackOverflowMenuButtonClick({ announcementId, buttonClicked: 'report' });
    window.location.href = reportUrl;
  }, [reportUrl, trackOverflowMenuButtonClick, announcementId]);

  return (
    <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <MenuTrigger button={button} onToggle={toggleMenu} />
      <PopoverContent ariaLabel={translate('Label.OverflowMenu')} side='bottom' align='end'>
        <DropdownMenuCloseContext.Provider value={closeMenu}>
          <Menu className='announcement-menu' size='Medium'>
            <MenuSection>
              {canEditAnnouncement && (
                <DropdownMenuItem translateKey='Action.EditAnnouncement' action={handleEdit} />
              )}
              {canCreateAnnouncements && (
                <DropdownMenuItem
                  translateKey='Action.DeleteAnnouncement'
                  action={handleDelete}
                  testId='announcement-display-menu-delete'
                />
              )}
              <DropdownMenuItem translateKey='Label.ReportAbuse' action={handleReport} />
            </MenuSection>
          </Menu>
        </DropdownMenuCloseContext.Provider>
      </PopoverContent>
    </Popover>
  );
};

export default withTranslations(AnnouncementMenu, groupAnnouncementsConfig);
