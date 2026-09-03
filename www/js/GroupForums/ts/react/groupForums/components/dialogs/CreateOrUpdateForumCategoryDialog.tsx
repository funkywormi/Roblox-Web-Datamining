import React, { useCallback, useState, useMemo } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  TextInput,
  Toggle,
  Tooltip,
  TooltipTrigger
} from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { CurrentUser } from 'Roblox';
import { groupsConfig } from '../../translation.config';
import forumsService from '../../services/forumsService';
import { ForumCategory, ChannelModerationType } from '../../types';
import groupForumsConstants from '../../constants/groupForumsConstants';
import {
  GetForumCategoryNameValidationErrorKey,
  GetForumCategoryErrorMessageErrorKey
} from '../../utils/groupForumsValidation';
import { logGroupForumsClickEvent } from '../../../shared/utils/logging';
import { useCommunityProductFeatures } from '../../../shared/contexts/CommunityProductFeaturesContext';
import useGuacConfig from '../../../shared/hooks/useGuacConfig';
import useGroupOwner from '../../../shared/hooks/useGroupOwner';
import useIsEligibleForUnrestrictedMessages from '../../../shared/hooks/useIsEligibleForUnrestrictedMessages';

type CreateOrUpdateForumCategoryDialogProps = {
  groupId: number;
  forumCategory: ForumCategory | null;
  onSuccess: () => void;
  onClose: () => void;
} & WithTranslationsProps;

const CreateOrUpdateForumCategoryDialog = ({
  groupId,
  forumCategory,
  onSuccess,
  onClose,
  translate
}: CreateOrUpdateForumCategoryDialogProps): JSX.Element => {
  const { systemFeedbackService } = useSystemFeedback();
  const { features } = useCommunityProductFeatures();
  const { data: groupDetailsUi } = useGuacConfig('group-details-ui');
  const ownerUserId = useGroupOwner(groupId);
  const isEligibleForUnrestrictedMessages = useIsEligibleForUnrestrictedMessages(groupId);

  const isCreating = !forumCategory;
  // Only the community owner may create restricted categories.
  const isOwner = ownerUserId !== undefined && ownerUserId === Number(CurrentUser.userId);
  const isEligibleForRoleRestricted =
    groupDetailsUi?.eligibleForRestrictedCommunications === 'Eligible';
  const showRoleRestrictedToggle = isCreating && features.ForumsRestrictedCategories && isOwner;
  const roleRestrictedToggleDisabled = !isEligibleForRoleRestricted;
  // Unrestricted Messages is a nested option under Role-restricted, available only to eligible
  // (Enterprise) communities. Gated on BOTH the tier-derived eligibility (server-computed) and the
  // ForumsUnrestrictedMessages rollout flag. Per product, the toggle is always shown when eligible
  // but greyed out until Role-restricted is enabled (so the dialog height doesn't jump).
  const showUnrestrictedMessagesToggle =
    showRoleRestrictedToggle &&
    features.ForumsUnrestrictedMessages &&
    isEligibleForUnrestrictedMessages;

  const [name, setName] = useState(forumCategory?.name || '');
  const [isRoleRestricted, setIsRoleRestricted] = useState<boolean>(false);
  const [allowsUnrestrictedMessages, setAllowsUnrestrictedMessages] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isEdited, setIsEdited] = useState<boolean>(false);

  const onSave = useCallback(async () => {
    try {
      setIsLoading(true);
      if (forumCategory) {
        await forumsService.updateGroupForumCategory(groupId, forumCategory.id, name);
      } else {
        await forumsService.createGroupForumCategory(
          groupId,
          name,
          showRoleRestrictedToggle ? isRoleRestricted : undefined,
          showUnrestrictedMessagesToggle && isRoleRestricted && allowsUnrestrictedMessages
            ? ChannelModerationType.Unrestricted
            : undefined
        );
      }
      onSuccess();
      onClose();
      logGroupForumsClickEvent({
        groupId,
        clickTargetType: forumCategory ? 'updateForumCategory' : 'createForumCategory'
      });
    } catch (e) {
      // get the errors message
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const message: string | undefined = e?.data?.errors?.[0]?.message;
      if (message) {
        setErrorMessage(message);
      }
      systemFeedbackService.warning(translate('NetworkError'));
    } finally {
      setIsLoading(false);
    }
  }, [
    onSuccess,
    onClose,
    groupId,
    forumCategory,
    name,
    isRoleRestricted,
    showRoleRestrictedToggle,
    allowsUnrestrictedMessages,
    showUnrestrictedMessagesToggle,
    translate,
    systemFeedbackService,
    setIsLoading
  ]);

  const validationErrorKey = useMemo(() => {
    return (
      GetForumCategoryNameValidationErrorKey(name) ||
      GetForumCategoryErrorMessageErrorKey(errorMessage)
    );
  }, [name, errorMessage]);

  const saveDisabled = useMemo(() => {
    return isLoading || !!validationErrorKey;
  }, [validationErrorKey, isLoading]);

  const handleNameInputChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsEdited(true);
      setErrorMessage('');
      setName(event.target.value);
    },
    [setName]
  );

  const titleText = useMemo(() => {
    return translate(forumCategory ? 'Action.RenameForumCategory' : 'Action.AddForumCategory');
  }, [forumCategory, translate]);

  const primaryButtonText = useMemo(() => {
    return translate(forumCategory ? 'Action.Rename' : 'Action.Add');
  }, [forumCategory, translate]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog
      open
      onOpenChange={handleOpenChange}
      isModal
      size='Small'
      type='Default'
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent className='edit-forum-category-dialog'>
        <DialogTitle className='text-heading-small padding-left-large padding-top-medium'>
          {titleText}
        </DialogTitle>
        <DialogBody>
          <TextInput
            id='edit-forum-category-name-input'
            inputContainerClassName='bg-shift-100'
            label={translate('Label.ForumCategoryName')}
            placeholder={translate('Label.ForumCategoryNamePlaceholder')}
            minLength={groupForumsConstants.limits.categoryNameMinLength}
            maxLength={groupForumsConstants.limits.categoryNameMaxLength}
            autoComplete='off'
            value={name}
            onChange={handleNameInputChanged}
          />
          <p className='group-forums-config-form-input-error'>
            {isEdited && validationErrorKey && translate(validationErrorKey)}
          </p>
          {showRoleRestrictedToggle && (
            <div className='padding-top-small'>
              {roleRestrictedToggleDisabled ? (
                <Tooltip position='top-start' title={translate('Label.RoleRestrictedAgeGate')}>
                  <TooltipTrigger asChild>
                    <div>
                      <Toggle
                        label={translate('Label.RoleRestrictedToggle')}
                        hint={translate('Description.RoleRestrictedToggle')}
                        size='Medium'
                        placement='Start'
                        isChecked={false}
                        isDisabled
                        onCheckedChange={() => undefined}
                        data-testid='restrict-category-toggle'
                      />
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              ) : (
                <Toggle
                  label={translate('Label.RoleRestrictedToggle')}
                  hint={translate('Description.RoleRestrictedToggle')}
                  size='Medium'
                  placement='Start'
                  isChecked={isRoleRestricted}
                  onCheckedChange={checked => {
                    setIsRoleRestricted(checked);
                    // Unrestricted Messages is nested under Role-restricted; clear it when
                    // Role-restricted is turned off so we never submit an invalid combination.
                    if (!checked) {
                      setAllowsUnrestrictedMessages(false);
                    }
                  }}
                  data-testid='restrict-category-toggle'
                />
              )}
            </div>
          )}
          {showUnrestrictedMessagesToggle && (
            <div className='padding-top-small'>
              <Toggle
                label={translate('Label.UnrestrictedMessagesToggle')}
                hint={translate('Description.UnrestrictedMessagesToggle')}
                size='Medium'
                placement='Start'
                isChecked={allowsUnrestrictedMessages}
                isDisabled={!isRoleRestricted}
                onCheckedChange={setAllowsUnrestrictedMessages}
                data-testid='unrestricted-messages-toggle'
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter className='flex gap-x-small'>
          <Button
            variant='Emphasis'
            size='Medium'
            className='fill basis-0'
            isDisabled={saveDisabled}
            onClick={onSave}>
            {primaryButtonText}
          </Button>
          <Button variant='Standard' size='Medium' className='fill basis-0' onClick={onClose}>
            {translate('Action.Cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default withTranslations(CreateOrUpdateForumCategoryDialog, groupsConfig);
