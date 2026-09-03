import { EnvironmentUrls } from 'Roblox';
import { ThumbnailAvatarHeadshotSize, ThumbnailTypes } from 'roblox-thumbnails';
import { TState } from '../../react/profileHeader/store/contextProvider';

const { apiGatewayUrl } = EnvironmentUrls;

export default {
  getFriendsExperimentationValuesUrl: (): string =>
    `${apiGatewayUrl}/product-experimentation-platform/v1/projects/1/layers/Social.Friends/values`,
  getAbuseReportRevampUrl: ({
    profileUserId,
    state
  }: {
    profileUserId: number;
    state: TState;
  }): string => {
    const params = new URLSearchParams({
      targetId: profileUserId.toString(),
      abuseVector: 'userprofile',
      custom: JSON.stringify({
        reminder: {
          title: state.names.displayName && btoa(encodeURIComponent(state.names.displayName)),
          message: state.names.username && btoa(encodeURIComponent(`@${state.names.username}`)),
          thumbnail: {
            containerClass: btoa('radius-circle height-1200 width-1200'),
            size: btoa(ThumbnailAvatarHeadshotSize.size48),
            targetId: btoa(profileUserId.toString()),
            type: btoa(ThumbnailTypes.avatarHeadshot)
          }
        }
      })
    });
    return `/report-abuse/?${params.toString()}`;
  }
};
