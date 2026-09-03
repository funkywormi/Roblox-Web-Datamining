import { EnvironmentUrls } from 'Roblox';

const { groupsApi } = EnvironmentUrls;

export default {
  urls: {
    getCreateFormUrl(groupId: number): string {
      return `${groupsApi}/v1/groups/${groupId}/forms`;
    },
    getSubmitFormResponseUrl(groupId: number, formId: number): string {
      return `${groupsApi}/v1/groups/${groupId}/forms/${formId}/responses`;
    },
    getFormResultsUrl(groupId: number, formId: number): string {
      return `${groupsApi}/v1/groups/${groupId}/forms/${formId}/results`;
    }
  }
};
