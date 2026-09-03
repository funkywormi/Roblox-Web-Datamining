// Keys are prefixed with `customForms.` to scope them to this feature in the shared
// QueryClient — avoids accidental collisions with generic keys (e.g. an `avatar-headshot`
// fetcher added by an unrelated consumer down the road).
type FormKeyTuple = [key: string, groupId: number, formId: number];
type UserKeyTuple = [key: string, userId: number];

export default {
  getFormResultsKey: (groupId: number, formId: number): FormKeyTuple => [
    'customForms.formResults',
    groupId,
    formId
  ],
  getPollVoterAvatarKey: (userId: number): UserKeyTuple => ['customForms.pollVoterAvatar', userId]
};
