const linkedAccountsTranslationConstants = {
  outgoing: {
    heading: "Heading.LinkedAccountsOutgoing",
    description: "Description.LinkedAccountsOutgoing",
    empty: "Description.LinkedAccountsEmptyOutgoing",
  },
  incoming: {
    heading: "Heading.LinkedAccountsIncoming",
    description: "Description.LinkedAccountsIncoming",
    empty: "Description.LinkedAccountsEmptyIncoming",
  },
  linkedOn: "Description.LinkedOn",
  loading: "Label.LoadingLinkedAccounts",
  unknownUser: "Label.UnknownUser",
  error: "Response.LinkedAccountsLoadFailed",
  retry: "Action.TryAgain",
  loadMore: "Action.LoadMore",
} as const;

export default linkedAccountsTranslationConstants;
