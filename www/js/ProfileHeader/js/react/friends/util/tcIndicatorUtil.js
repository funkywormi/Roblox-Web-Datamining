import { fetchFeatureCheckResponseWithNamespace } from '../services/accessManagementService';

const canAccessTCIndicatorViaAmp = async () => {
  try {
    const response = await fetchFeatureCheckResponseWithNamespace(
      'TrustedConnectionIndicatorOnUserTileAccess',
      null, // no extra parameters
      null, // no successful action passed
      'connection_social_identity/TrustedConnectionIndicator'
    );
    const canAccessTCIndicator = response?.access === 'Granted';
    return canAccessTCIndicator;
  } catch (error) {
    console.error(error);
    // Error fetching Trusted Connection Indicator access; keep default false state
    return false;
  }
};

export default canAccessTCIndicatorViaAmp;
