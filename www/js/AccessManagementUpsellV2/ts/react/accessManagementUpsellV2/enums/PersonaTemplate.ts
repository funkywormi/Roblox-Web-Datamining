// Persona template names accepted by the identity-verification
// `start-verification` endpoint (mirrors the backend `PersonaTemplate` enum
// member names). Only send a template when a recourse requires a
// feature-specific flow; omit it for the default IDV/FAE paths.
enum PersonaTemplate {
  // Appeals-specific IDV template (backend support: identity-verification #1037).
  IdvAppeal = 'IdvAppeal'
}

export default PersonaTemplate;
