// Client-only signal describing which product flow launched the AMP wizard.
// A shared recourse (e.g. GovernmentId) can vary behavior off this value
// (e.g. selecting a feature-specific Persona template). Never sent to the AMP
// backend — it only rides on the client-side start event.
enum WizardIntent {
  // Alt-account moderation appeal flow.
  Appeals = 'appeals'
}

export default WizardIntent;
