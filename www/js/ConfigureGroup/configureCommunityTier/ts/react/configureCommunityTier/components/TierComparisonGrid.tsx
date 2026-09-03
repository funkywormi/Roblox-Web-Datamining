/* eslint-disable user-communities/no-large-components -- responsive comparison renders desktop grid and mobile tabbed view */
import React from 'react';
import classNames from 'classnames';
import { TranslateFunction, useTranslation } from 'react-utilities';
import { Icon, Tabs, TabsContent, TabsList, TabsTrigger, Chip, Divider } from '@rbx/foundation-ui';
import { CommunityTier, TierCellStatus, TierRequirement } from '../../shared/communityTier/types';
import {
  TIER_NAME_KEYS,
  TIER_DESCRIPTION_KEYS,
  TIER_ORDER,
  CAPABILITIES,
  REQUIREMENTS_CONFIG,
  RequirementKey
} from '../../shared/communityTier/communityTierConstants';
import RequirementActionButton from './RequirementActionButton';

const DESKTOP_ROOT = 'configure-community-tier-grid';
const MOBILE_ROOT = 'configure-community-tier-mobile';
const NOT_APPLICABLE = '—';

function RequirementStatusMark({
  status,
  iconSize
}: {
  status: TierCellStatus;
  iconSize: 'Medium' | 'Large';
}): JSX.Element {
  if (status === 'notApplicable') {
    return <span className='text-body-large content-default'>{NOT_APPLICABLE}</span>;
  }

  const met = status === 'met';
  return (
    <Icon
      name={met ? 'icon-regular-circle-check' : 'icon-regular-circle-x'}
      size={iconSize}
      className={met ? 'content-system-success' : 'content-system-alert'}
    />
  );
}

/** Resolves a requirement's title and description, falling back to its raw key. */
function getRequirementText(
  requirementKey: string,
  translate: TranslateFunction
): { title: string; description: string } {
  const config = REQUIREMENTS_CONFIG[requirementKey as RequirementKey];

  return {
    title: config ? translate(config.titleKey) : requirementKey,
    description: config ? translate(config.descriptionKey) : ''
  };
}

type TierCellOptions = {
  isCurrent: boolean;
  isHeader: boolean;
  isLast: boolean;
  separator: boolean;
};

function tierCellClassName(
  { isCurrent, isHeader, isLast, separator }: TierCellOptions,
  surfaceClass: string
): string {
  return classNames(`${DESKTOP_ROOT}__tier-cell`, surfaceClass, {
    [`${DESKTOP_ROOT}__tier-cell--header`]: isHeader,
    [`${DESKTOP_ROOT}__tier-cell--current`]: isCurrent,
    [`${DESKTOP_ROOT}__tier-cell--last`]: isLast,
    [`${DESKTOP_ROOT}__tier-cell--separator`]: separator,
    [`${DESKTOP_ROOT}__tier-header--current`]: isHeader && isCurrent
  });
}

type TierComparisonGridProps = {
  currentTier: CommunityTier;
  requirements: TierRequirement[];
  onStartRequirement: (requirementKey: string) => void;
};

function tierTabValue(tier: CommunityTier): string {
  return String(tier);
}

function CurrentTierChip({ label, className }: { label: string; className?: string }): JSX.Element {
  return (
    <Chip
      className={classNames('bg-system-contrast content-inverse-system-contrast', className)}
      text={label}
      variant='Standard'
      size='Small'
      isChecked={false}
    />
  );
}

type MobileRequirementRowProps = {
  requirement: TierRequirement;
  tier: CommunityTier;
  startLabel: string;
  translate: TranslateFunction;
  onStartRequirement: (requirementKey: string) => void;
};

function MobileRequirementRow({
  requirement,
  tier,
  startLabel,
  translate,
  onStartRequirement
}: MobileRequirementRowProps): JSX.Element {
  const { title, description } = getRequirementText(requirement.requirementKey, translate);
  const status = requirement.tierStatus[tier];

  return (
    <div className={`${MOBILE_ROOT}__requirement-item`}>
      <div className={`${MOBILE_ROOT}__requirement-row`}>
        <RequirementStatusMark status={status} iconSize='Medium' />
        <div className={`${MOBILE_ROOT}__requirement-text`}>
          <span className='text-label-large content-emphasis'>{title}</span>
          {description && <span className='text-body-medium content-default'>{description}</span>}
        </div>
      </div>
      <div className={`${MOBILE_ROOT}__requirement-action`}>
        <RequirementActionButton
          requirement={requirement}
          startLabel={startLabel}
          onStart={onStartRequirement}
        />
      </div>
    </div>
  );
}

type TierMobileTabPanelProps = {
  tier: CommunityTier;
  currentTier: CommunityTier;
  requirements: TierRequirement[];
  capabilitiesLabel: string;
  requirementsLabel: string;
  currentLabel: string;
  startLabel: string;
  translate: TranslateFunction;
  onStartRequirement: (requirementKey: string) => void;
};

function TierMobileTabPanel({
  tier,
  currentTier,
  requirements,
  capabilitiesLabel,
  requirementsLabel,
  currentLabel,
  startLabel,
  translate,
  onStartRequirement
}: TierMobileTabPanelProps): JSX.Element {
  const applicableRequirements = requirements.filter(
    requirement => requirement.tierStatus[tier] !== 'notApplicable'
  );

  return (
    <React.Fragment>
      <div className={`${MOBILE_ROOT}__tier-header`}>
        <div className={`${MOBILE_ROOT}__tier-title-row`}>
          <span className='text-title-large content-emphasis'>
            {translate(TIER_NAME_KEYS[tier])}
          </span>
          {tier === currentTier && <CurrentTierChip label={currentLabel} />}
        </div>
        <span className='text-body-medium content-default'>
          {translate(TIER_DESCRIPTION_KEYS[tier])}
        </span>
      </div>

      <div className={`text-label-medium content-default ${MOBILE_ROOT}__section-heading`}>
        {capabilitiesLabel}
      </div>
      <Divider />
      {CAPABILITIES.map((capability, capabilityIndex) => {
        const valueKey = capability.valueKeys[tier];

        return (
          <React.Fragment key={capability.capabilityKey}>
            <div className={`${MOBILE_ROOT}__capability-item`}>
              <div className={`${MOBILE_ROOT}__capability-label-row`}>
                <Icon
                  aria-hidden='true'
                  name={capability.iconName as React.ComponentProps<typeof Icon>['name']}
                  size='Medium'
                  className='content-emphasis'
                />
                <span
                  className={classNames(
                    'text-body-medium content-default',
                    `${MOBILE_ROOT}__capability-label-text`
                  )}>
                  {translate(capability.labelKey)}
                </span>
              </div>
              <span
                className={classNames(
                  'text-body-large content-emphasis',
                  `${MOBILE_ROOT}__capability-value`
                )}>
                {valueKey ? translate(valueKey) : NOT_APPLICABLE}
              </span>
            </div>
            {capabilityIndex < CAPABILITIES.length - 1 && <Divider />}
          </React.Fragment>
        );
      })}

      <div className={`text-label-medium content-default ${MOBILE_ROOT}__section-heading`}>
        {requirementsLabel}
      </div>
      <Divider />
      {applicableRequirements.map((requirement, requirementIndex) => (
        <React.Fragment key={requirement.requirementKey}>
          <MobileRequirementRow
            requirement={requirement}
            tier={tier}
            startLabel={startLabel}
            translate={translate}
            onStartRequirement={onStartRequirement}
          />
          {requirementIndex < applicableRequirements.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

type DesktopRequirementRowProps = {
  requirement: TierRequirement;
  currentTier: CommunityTier;
  isLast: boolean;
  startLabel: string;
  translate: TranslateFunction;
  onStartRequirement: (requirementKey: string) => void;
};

function DesktopRequirementRow({
  requirement,
  currentTier,
  isLast,
  startLabel,
  translate,
  onStartRequirement
}: DesktopRequirementRowProps): JSX.Element {
  const { title, description } = getRequirementText(requirement.requirementKey, translate);

  return (
    <React.Fragment>
      <div className={`${DESKTOP_ROOT}__requirement-label-cell`}>
        <div className={`${DESKTOP_ROOT}__requirement-text`}>
          <span className='text-label-large content-emphasis'>{title}</span>
          {description && <span className='text-body-medium content-default'>{description}</span>}
        </div>
        <div className={`${DESKTOP_ROOT}__button-slot`}>
          <RequirementActionButton
            requirement={requirement}
            startLabel={startLabel}
            onStart={onStartRequirement}
          />
        </div>
      </div>
      {TIER_ORDER.map(tier => {
        const status = requirement.tierStatus[tier];

        return (
          <div
            key={`${requirement.requirementKey}-${tier}`}
            className={tierCellClassName(
              {
                isCurrent: tier === currentTier,
                isHeader: false,
                isLast,
                separator: false
              },
              'bg-surface-100'
            )}>
            <RequirementStatusMark status={status} iconSize='Large' />
          </div>
        );
      })}
    </React.Fragment>
  );
}

function TierComparisonGrid({
  currentTier,
  requirements,
  onStartRequirement
}: TierComparisonGridProps): JSX.Element {
  const { translate } = useTranslation();

  const capabilitiesLabel = translate('Heading.Capabilities');
  const requirementsLabel = translate('Heading.Requirements');
  const currentLabel = translate('Label.Current');
  const startLabel = translate('Action.Start');

  const lastRequirementIndex = requirements.length - 1;

  return (
    <React.Fragment>
      <div className={classNames(DESKTOP_ROOT, 'hide-on-native')}>
        <div className={`${DESKTOP_ROOT}__scroll`}>
          <div className={`${DESKTOP_ROOT}__table`}>
            {/* Tab row: reserves space above the columns for the "Current" pill. */}
            <div className={`${DESKTOP_ROOT}__tab-spacer`} />
            {TIER_ORDER.map(tier => (
              <div key={`tab-${tier}`} className={`${DESKTOP_ROOT}__tab-spacer--tier`}>
                {tier === currentTier && (
                  <div className={`${DESKTOP_ROOT}__tab`}>
                    <CurrentTierChip label={currentLabel} />
                  </div>
                )}
              </div>
            ))}

            {/* Header row */}
            <div className={`${DESKTOP_ROOT}__label-cell ${DESKTOP_ROOT}__label-cell--sep`}>
              <span className='text-body-large content-default'>{capabilitiesLabel}</span>
            </div>
            {TIER_ORDER.map(tier => (
              <div
                key={`header-${tier}`}
                className={tierCellClassName(
                  {
                    isCurrent: tier === currentTier,
                    isHeader: true,
                    isLast: false,
                    separator: true
                  },
                  'bg-surface-300'
                )}>
                <span className='text-label-large content-emphasis'>
                  {translate(TIER_NAME_KEYS[tier])}
                </span>
                <span className='text-body-medium content-default'>
                  {translate(TIER_DESCRIPTION_KEYS[tier])}
                </span>
              </div>
            ))}

            {/* Capability rows */}
            {CAPABILITIES.map(capability => (
              <React.Fragment key={capability.capabilityKey}>
                <div className={`${DESKTOP_ROOT}__capability-label-cell`}>
                  <Icon
                    aria-hidden='true'
                    name={capability.iconName as React.ComponentProps<typeof Icon>['name']}
                    size='Medium'
                    className='content-emphasis'
                  />
                  <span
                    className={classNames(
                      'text-body-large content-default',
                      `${DESKTOP_ROOT}__capability-label-text`
                    )}>
                    {translate(capability.labelKey)}
                  </span>
                </div>
                {TIER_ORDER.map(tier => {
                  const valueKey = capability.valueKeys[tier];

                  return (
                    <div
                      key={`${capability.capabilityKey}-${tier}`}
                      className={tierCellClassName(
                        {
                          isCurrent: tier === currentTier,
                          isHeader: false,
                          isLast: false,
                          separator: true
                        },
                        'bg-surface-100'
                      )}>
                      <span className='text-body-large content-default'>
                        {valueKey ? translate(valueKey) : NOT_APPLICABLE}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

            {/* Requirements section header */}
            <div className={`${DESKTOP_ROOT}__label-cell ${DESKTOP_ROOT}__label-cell--sep`}>
              <span className='text-body-large content-default'>{requirementsLabel}</span>
            </div>
            {TIER_ORDER.map(tier => (
              <div
                key={`req-header-${tier}`}
                className={tierCellClassName(
                  {
                    isCurrent: tier === currentTier,
                    isHeader: false,
                    isLast: false,
                    separator: true
                  },
                  'bg-surface-100'
                )}
              />
            ))}

            {/* Requirement rows */}
            {requirements.map((requirement, requirementIndex) => (
              <DesktopRequirementRow
                key={requirement.requirementKey}
                requirement={requirement}
                currentTier={currentTier}
                isLast={requirementIndex === lastRequirementIndex}
                startLabel={startLabel}
                translate={translate}
                onStartRequirement={onStartRequirement}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={classNames(MOBILE_ROOT, 'show-on-native')}>
        <Tabs
          key={currentTier}
          className={`${MOBILE_ROOT}__tabs`}
          size='Medium'
          variant='Contained'
          defaultValue={tierTabValue(currentTier)}>
          <TabsList>
            {TIER_ORDER.map(tier => (
              <TabsTrigger key={tier} value={tierTabValue(tier)}>
                {translate(TIER_NAME_KEYS[tier])}
              </TabsTrigger>
            ))}
          </TabsList>
          {TIER_ORDER.map(tier => (
            <TabsContent key={tier} value={tierTabValue(tier)}>
              <TierMobileTabPanel
                tier={tier}
                currentTier={currentTier}
                requirements={requirements}
                capabilitiesLabel={capabilitiesLabel}
                requirementsLabel={requirementsLabel}
                currentLabel={currentLabel}
                startLabel={startLabel}
                translate={translate}
                onStartRequirement={onStartRequirement}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </React.Fragment>
  );
}

export default TierComparisonGrid;
