import { Recourse } from '../../enums';
import { RecourseResponse } from '../../types/AmpTypes';

export type TVpcV2Candidate = {
  kind: 'SingleVpc' | 'IdvAndVpc';
  vpcRecourse: RecourseResponse;
};

function isVpcRecourse(recourse: RecourseResponse): boolean {
  return (
    recourse.action === Recourse.ParentConsentRequest ||
    recourse.action === Recourse.ParentLinkRequest
  );
}

// The v2 handoff only owns the established single-VPC path and the explicit
// IDV-or-VPC chooser. Other mixed recourse sets remain on the v1 wizard.
export function getVpcV2Candidate(
  recourses?: RecourseResponse[] | null
): TVpcV2Candidate | undefined {
  const onlyRecourse = recourses?.length === 1 ? recourses[0] : undefined;
  if (onlyRecourse && isVpcRecourse(onlyRecourse)) {
    return { kind: 'SingleVpc', vpcRecourse: onlyRecourse };
  }

  if (
    recourses?.length === 2 &&
    recourses.some(recourse => recourse.action === Recourse.GovernmentId)
  ) {
    const vpcRecourse = recourses.find(isVpcRecourse);
    if (vpcRecourse) {
      return { kind: 'IdvAndVpc', vpcRecourse };
    }
  }

  return undefined;
}

export function isVpcRequestTypeExcluded(
  candidate: TVpcV2Candidate | undefined,
  excludedRequestTypes: string[] | undefined
): boolean {
  const requestType = candidate?.vpcRecourse.parentConsentTypes?.[0];
  return (
    excludedRequestTypes !== undefined &&
    requestType !== undefined &&
    excludedRequestTypes.includes(requestType)
  );
}
