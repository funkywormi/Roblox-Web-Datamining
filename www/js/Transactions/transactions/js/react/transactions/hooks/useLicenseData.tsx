import { useEffect, useState } from 'react';
import { getAgreementInfo, getCurrentAccount, getIpFamilyById } from '../../../../ts';

export interface LicenseData {
  licenseName: string;
  ipListingThumbnailAssetId: number;
  ipFamilyName: string;
}

export interface UseLicenseDataResult {
  licenseData: LicenseData | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook to fetch license data for a given agreementId.
 * Uses content-licensing-api's hydrated agreement endpoint which returns
 * license and listing data inline, reducing from 4 API calls to 3:
 *   1. getCurrentAccount (rights-management-api)
 *   2. getAgreementInfo (content-licensing-api — includes license + listing)
 *   3. getIpFamilyById (rights-management-api)
 */
export const useLicenseData = (agreementId?: string): UseLicenseDataResult => {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [isLoading, setIsLoading] = useState(!!agreementId);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!agreementId) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const account = await getCurrentAccount();
        const agreement = await getAgreementInfo(account.id, agreementId);
        const ipFamily = await getIpFamilyById(agreement.accountId, agreement.listing.ipFamilyId);

        if (isMounted) {
          setLicenseData({
            licenseName: agreement.license.name,
            ipListingThumbnailAssetId: agreement.listing.thumbnailAssetIds[0],
            ipFamilyName: ipFamily.name
          });
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [agreementId]);

  return { licenseData, isLoading, isError };
};
