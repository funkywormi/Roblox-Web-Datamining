import { EnvironmentUrls } from 'Roblox';
import { useMemo } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { Action } from '@rbx/profile-platform';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';

export type ProfileActions = {
  [key in Action]?: ProfileAction;
};

export interface ProfileAction {
  label: string;
  onClick: () => void;
  href?: string;
  btnVariant?: 'contained' | 'outlined' | 'text';
  btnColor?: 'inherit' | 'primary' | 'primaryBrand' | 'secondary' | 'destructive';
  disabled?: boolean;
  tooltip?: string;
  needsVerification?: boolean;
}

export type ProfileActionWithKey = ProfileAction & { key: Action };

const useProfileActions = (): ProfileActions => {
  const context = useGroupProfileHeaderContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();

  const profileActions = useMemo(() => {
    const changeOwnerCreatorHubUrl = `https://create.${EnvironmentUrls.domain}/dashboard/group/profile?activeTab=GroupProfileTab&groupId=${context.groupId}`;
    const mappedActions: ProfileActions = {
      CancelJoinCommunityRequest: {
        label: translate('Action.CancelRequest'),
        onClick: context.cancelJoinRequest,
        btnVariant: 'outlined',
        btnColor: 'secondary'
      },
      ChangeCommunityOwner: {
        label: translate('Label.ChangeOwner'),
        href: changeOwnerCreatorHubUrl,
        onClick: context.showChangeOwnerModal
      },
      ClaimCommunityOwnership: {
        label: translate('Action.ClaimOwnership'),
        onClick: context.claimOwnership
      },
      ConfigureCommunity: {
        label: translate('Action.ConfigureGroup'),
        onClick: () => {
          window.location.href = `${EnvironmentUrls.websiteUrl}/communities/configure?id=${context.groupId}`;
        }
      },
      Follow: {
        label: translate('Action.Follow'),
        onClick: context.joinGroup,
        btnVariant: 'contained',
        btnColor: 'primaryBrand'
      },
      JoinCommunity: {
        label: translate('Action.JoinGroup'),
        onClick: context.joinGroup,
        btnVariant: 'contained',
        btnColor: 'primaryBrand'
      },
      LeaveCommunity: {
        label: translate('Action.LeaveGroup'),
        onClick: context.showLeaveGroupOrChangeOwnerModal
      },
      MakePrimaryCommunity: {
        label: translate('Action.MakePrimary'),
        onClick: context.makePrimary
      },
      RemovePrimaryCommunity: {
        label: translate('Action.RemovePrimary'),
        onClick: context.removePrimary
      },
      Report: {
        label: translate('Action.ReportAbuse'),
        onClick: context.showReportAbuseModal
      },
      Unfollow: {
        label: translate('Action.Unfollow'),
        onClick: context.showLeaveGroupOrChangeOwnerModal
      }
    };

    if (navigator.clipboard) {
      mappedActions.CopyLink = {
        label: translate('Label.CopyLink'),
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(
              `${EnvironmentUrls.websiteUrl}/share/g/${context.groupId}`
            );
            systemFeedbackService.success(translate('Label.LinkCopied'));
          } catch {
            systemFeedbackService.warning(translate('Error.CopyLink'));
          }
        }
      };
    }

    return mappedActions;
  }, [context, systemFeedbackService, translate]);

  return profileActions;
};

export default useProfileActions;
