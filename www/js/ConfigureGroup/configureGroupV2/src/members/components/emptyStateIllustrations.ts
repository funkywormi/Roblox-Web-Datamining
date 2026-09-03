import invitesDark from '@rbx/foundation-images/pictograms/envelope_dark.svg';
import invitesLight from '@rbx/foundation-images/pictograms/envelope_light.svg';
import membersDark from '@rbx/foundation-images/pictograms/two_people_dark.svg';
import membersLight from '@rbx/foundation-images/pictograms/two_people_light.svg';
import type { EmptyStateIllustration } from '../../components/EmptyState';

const emptyStateIllustrations = {
  members: { light: membersLight, dark: membersDark },
  invites: { light: invitesLight, dark: invitesDark },
} satisfies Record<string, EmptyStateIllustration>;

export default emptyStateIllustrations;
