import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Dropdown,
  Menu,
  MenuItem,
  MenuSection
} from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { useAuditLog } from '../hooks/useAuditLog';
import { AuditLogEntry, AuditLogPolicies } from '../types';
import { actionTypes as auditLogActionTypes, urls } from '../constants/auditLogConstants';
import { formatDate, formatTime, formatFullDateTime } from '../../shared/utils/dateUtils';
import Pager from '../../shared/components/Pager';
import SearchInput from '../../shared/components/SearchInput';
import InlineProgressLoader from '../../shared/components/InlineProgressLoader';
import AuditLogDescription from '../components/AuditLogDescription';

export interface AuditLogContainerProps {
  groupId: number;
  policies?: AuditLogPolicies;
}

const { getUserProfileUrl } = urls;

interface ExpandableDescriptionProps {
  formattedDescription?: AuditLogEntry['formattedDescription'];
}

const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({ formattedDescription }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!formattedDescription?.details?.length) {
    return <AuditLogDescription result={formattedDescription} />;
  }

  return (
    <Accordion>
      <AccordionItem isOpen={isOpen} onOpenChange={setIsOpen}>
        <AccordionItemTrigger>
          <span className='text-body-medium'>
            <AuditLogDescription result={formattedDescription} />
          </span>
        </AccordionItemTrigger>
        <AccordionItemContent className='!padding-bottom-xsmall'>
          {formattedDescription?.details?.map(detail => (
            <div key={detail.messageKey}>
              <AuditLogDescription result={detail} />
            </div>
          ))}
        </AccordionItemContent>
      </AccordionItem>
    </Accordion>
  );
};

const AuditLogContainer: React.FC<AuditLogContainerProps> = ({ groupId, policies = {} }) => {
  const { translate } = useTranslation();
  const {
    logs,
    isLoading,
    loadError,
    selectedActionType,
    actionTypes,
    currentPage,
    hasNextPage,
    hasPrevPage,
    handleSearch,
    handleActionTypeChange,
    loadNextPage,
    loadPrevPage
  } = useAuditLog({ groupId, policies, translate });

  const selectedActionLabel =
    actionTypes.find(a => a.key === selectedActionType)?.label || translate('Label.All');

  const renderLogEntry = (log: AuditLogEntry, index: number) => {
    const { actor, actionType, created, formattedDescription } = log;
    const { user, role } = actor;

    return (
      <tr
        key={`${user.userId}-${actionType}-${created}-${index}`}
        className={isLoading ? 'faded' : ''}>
        <td className='date'>
          <div>{formatDate(created, { month: 'short', day: '2-digit', year: 'numeric' })}</div>
          <div>{formatTime(created)}</div>
        </td>
        <td className='user'>
          <div className='avatar-card'>
            <div className='avatar avatar-headshot avatar-headshot-xs'>
              <a className='avatar-card-link' href={getUserProfileUrl(user.userId)}>
                <Thumbnail2d
                  type={ThumbnailTypes.avatarHeadshot}
                  targetId={user.userId}
                  containerClass='avatar-card-image'
                />
              </a>
            </div>
            <div className='avatar-card-caption'>
              <a
                className='avatar-card-name text-name text-overflow'
                href={getUserProfileUrl(user.userId)}>
                {user.nameForDisplay || user.displayName || user.username}
              </a>
              <div className='avatar-card-label text-secondary text-overflow'>
                {/* eslint-disable-next-line react/jsx-no-literals */}
                {`@${user.username}`}
              </div>
              <div className='avatar-card-label text-secondary text-overflow'>{role.name}</div>
            </div>
          </div>
        </td>
        <td className='description'>
          <div className='description-text'>
            {actionType === auditLogActionTypes.updateRoleSetPermissions ||
            actionType === auditLogActionTypes.updateRolesetData ? (
              <ExpandableDescription formattedDescription={formattedDescription} />
            ) : (
              <AuditLogDescription result={formattedDescription} />
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderMobileLogEntry = (log: AuditLogEntry, index: number) => {
    const { actor, actionType, created, formattedDescription } = log;
    const { user, role } = actor;

    return (
      <li
        key={`mobile-${user.userId}-${actionType}-${created}-${index}`}
        className={`list-item ${isLoading ? 'faded' : ''}`}>
        <div className='avatar avatar-headshot avatar-headshot-xs'>
          <a className='avatar-card-link' href={getUserProfileUrl(user.userId)}>
            <Thumbnail2d
              type={ThumbnailTypes.avatarHeadshot}
              targetId={user.userId}
              containerClass='avatar-card-image'
            />
          </a>
        </div>
        <div className='audit-log-caption'>
          <a className='text-name text-overflow' href={getUserProfileUrl(user.userId)}>
            {user.nameForDisplay || user.displayName || user.username}
          </a>
          <div className='avatar-card-label text-secondary text-overflow'>{role.name}</div>
          <div className='description'>
            {actionType === auditLogActionTypes.updateRoleSetPermissions ||
            actionType === auditLogActionTypes.updateRolesetData ? (
              <ExpandableDescription formattedDescription={formattedDescription} />
            ) : (
              <AuditLogDescription result={formattedDescription} />
            )}
          </div>
          <div className='text-date-hint'>{formatFullDateTime(created)}</div>
        </div>
      </li>
    );
  };

  return (
    <React.Fragment>
      <div className='container-header'>
        <h2 className='group-title-with-input'>{translate('Heading.AuditLog')}</h2>
        <div className='input-group search-container'>
          <SearchInput
            placeholder={translate('Label.SearchUsers')}
            size='Medium'
            onSubmit={handleSearch}
            onClear={() => handleSearch('')}
          />
          <div id='audit-log-type-dropdown' className='input-group-btn group-dropdown'>
            <Dropdown
              className='audit-log-action-type-dropdown'
              value={selectedActionType}
              placeholder={selectedActionLabel}
              size='Medium'
              onValueChange={handleActionTypeChange}>
              <Menu className='audit-log-filter-menu'>
                <MenuSection>
                  {actionTypes.map(({ key, label }) => (
                    <MenuItem key={key} value={key} title={label} />
                  ))}
                </MenuSection>
              </Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className='section'>
        {isLoading && logs.length === 0 && !loadError && (
          <InlineProgressLoader variant='Indeterminate' ariaLabel={translate('Label.Loading')} />
        )}

        {!isLoading && !loadError && logs.length === 0 && (
          <div className='section-content-off'>{translate('Message.NoRecordsFound')}</div>
        )}

        {!isLoading && loadError && <div className='section-content-off'>{loadError}</div>}

        {logs.length > 0 && (
          <React.Fragment>
            <table className={`audit-log table table-striped ${isLoading ? 'faded' : ''}`}>
              <thead>
                <tr>
                  <th className='date'>{translate('Heading.Date')}</th>
                  <th className='user'>{translate('Heading.User')}</th>
                  <th className='description'>{translate('Heading.Description')}</th>
                </tr>
              </thead>
              <tbody>{logs.map(renderLogEntry)}</tbody>
            </table>

            <ul className='audit-log vlist'>{logs.map(renderMobileLogEntry)}</ul>
          </React.Fragment>
        )}

        {(logs.length > 0 || hasPrevPage) && (
          <Pager
            currentPage={currentPage}
            hasNextPage={hasNextPage && !isLoading}
            hasPrevPage={hasPrevPage && !isLoading}
            onPrevPage={loadPrevPage}
            onNextPage={loadNextPage}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default AuditLogContainer;
