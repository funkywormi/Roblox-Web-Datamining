import { callBehaviour } from '@rbx/core-scripts/guac';

type GetPlayerSupportPolicyResponse = {
  SupportCenterEnabled?: boolean;
};

export async function getSupportCenterEnabled(): Promise<boolean> {
  const result = await callBehaviour<GetPlayerSupportPolicyResponse>('player-support');
  return Boolean(result.SupportCenterEnabled);
}
