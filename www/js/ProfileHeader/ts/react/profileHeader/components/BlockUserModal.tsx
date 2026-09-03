import React, { useEffect } from 'react';
import { UserProfileField, writeQuery } from 'roblox-user-profiles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button
} from '@rbx/ui';
import { prefetchAbuseUI } from '@rbx/abuse-report-ui';
import urlConstants from '../../../common/constants/urlConstants';
import useProfileHeaderContext from '../hooks/useProfileHeaderContext';
import { ActionType } from '../store/action';
import profileHeaderConstants from '../constants/profileHeaderConstants';
import userBlockingService from '../services/userBlockingService';
import BlockUserError from '../enums/BlockUserError';
import TError from '../types/errorTypes';
import useIsNewAbuseDialogEnabled from '../hooks/useIsNewAbuseDialogEnabled';

const BlockUserModal = ({
  translate,
  profileUserId
}: {
  translate: (key: string, params?: { [key: string]: string }) => string;
  profileUserId: number;
}): JSX.Element | null => {
  const { state, dispatch } = useProfileHeaderContext();
  const combinedName = state.names.combinedName || '';
  const isNewAbuseDialogEnabled = useIsNewAbuseDialogEnabled();

  const hideUserBlockModal = () => {
    dispatch({ type: ActionType.SHOW_BLOCK_USER_MODAL, show: false });
  };

  const blockUser = async () => {
    try {
      await userBlockingService.blockUser(profileUserId);
      dispatch({ type: ActionType.UPDATE_USER_BLOCK, block: true });
      const userProfileFields = [
        UserProfileField.Names.CombinedName,
        UserProfileField.Names.Username,
        UserProfileField.Names.DisplayName,
        UserProfileField.Names.Alias
      ];
      writeQuery(profileUserId, userProfileFields, {
        names: {
          alias: null,
          combinedName: state.names.displayName,
          displayName: state.names.displayName,
          username: state.names.username
        }
      });
    } catch (error) {
      dispatch({
        type: ActionType.SET_ERROR_MESSAGE,
        message: translate(profileHeaderConstants.translationKeys.error.blockFailed)
      });
    }
  };

  const unblockUser = async () => {
    try {
      await userBlockingService.unblockUser(profileUserId);
      dispatch({ type: ActionType.UPDATE_USER_BLOCK, block: false });
    } catch (error) {
      let message = translate(profileHeaderConstants.translationKeys.error.blockRequestFailed);
      switch ((error as TError).data) {
        case BlockUserError.BlockLimitExceeded:
          message = translate(profileHeaderConstants.translationKeys.error.blockLimitExceeded);
          break;
        case BlockUserError.TargetAlreadyBlocked:
          message = translate(profileHeaderConstants.translationKeys.error.targetAlreadyBlocked);
          break;
        case BlockUserError.ParentManaged:
          message = translate(profileHeaderConstants.translationKeys.error.parentManaged);
          break;
        case BlockUserError.TargetNotBlocked:
          message = translate(profileHeaderConstants.translationKeys.error.targetNotBlocked);
          break;
        case BlockUserError.BlockedOnPlatform:
          message = translate(profileHeaderConstants.translationKeys.error.blockedOnPlatform);
          break;
        default:
      }
      dispatch({
        type: ActionType.SET_ERROR_MESSAGE,
        message
      });
    }
  };

  const blockAndReport = async () => {
    await blockUser();
    if (isNewAbuseDialogEnabled) {
      dispatch({ type: ActionType.SHOW_ABUSE_REPORT_DIALOG, show: true });
    } else {
      window.location.href = urlConstants.getAbuseReportRevampUrl({ profileUserId, state });
    }
  };

  useEffect(() => {
    if (state.showUserBlockModal && isNewAbuseDialogEnabled) {
      prefetchAbuseUI({ abuseVector: 'user_profile', targetIdStr: profileUserId.toString() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only trigger when shown
  }, [state.showUserBlockModal]);

  const blockTranslationKeys: {
    title: string;
    body: string;
    blockButton: string;
    blockAndReportButton: string;
    cancelButton: string;
  } = profileHeaderConstants.translationKeys.modal.block;

  const unblockTranslationKeys: {
    title: string;
    body: string;
    unblockButton: string;
    cancelButton: string;
  } = profileHeaderConstants.translationKeys.modal.unblock;

  if (!state.showUserBlockModal) {
    return null;
  }

  return state.isBlocked ? (
    <Dialog open={state.showUserBlockModal} onClose={hideUserBlockModal}>
      <DialogTitle>
        {translate(unblockTranslationKeys.title, {
          DisplayName: combinedName
        })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{translate(unblockTranslationKeys.body)}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color='primary' variant='text' onClick={hideUserBlockModal}>
          {translate(unblockTranslationKeys.cancelButton)}
        </Button>
        <Button color='primaryBrand' variant='contained' onClick={unblockUser}>
          {translate(unblockTranslationKeys.unblockButton)}
        </Button>
      </DialogActions>
    </Dialog>
  ) : (
    <Dialog open={state.showUserBlockModal} onClose={hideUserBlockModal}>
      <DialogTitle>
        {translate(blockTranslationKeys.title, {
          DisplayName: combinedName
        })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <span
            dangerouslySetInnerHTML={{
              __html: translate(blockTranslationKeys.body)
            }}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color='destructive' variant='outlined' onClick={blockUser}>
          {translate(blockTranslationKeys.blockButton)}
        </Button>
        <Button color='destructive' variant='outlined' onClick={blockAndReport}>
          {translate(blockTranslationKeys.blockAndReportButton)}
        </Button>
        <Button color='primary' variant='text' onClick={hideUserBlockModal}>
          {translate(blockTranslationKeys.cancelButton)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockUserModal;
