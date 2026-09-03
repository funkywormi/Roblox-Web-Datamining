import { useEffect, useState } from "react";
import getAccountCountry from "../services/accountCountryService";

export default function useAccountCountry() {
  const [countryName, setCountryName] = useState("");
  const [localizedName, setLocalizedName] = useState("");
  const [countryId, setCountryId] = useState(-1);
  const [subdivisionIso, setSubdivisionIso] = useState<string | undefined>(undefined);
  const [localizedSubdivision, setLocalizedSubdivision] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchAccountCountryCode() {
      try {
        const {
          data: { value },
        } = await getAccountCountry();
        setCountryName(value.countryName);
        setLocalizedName(value.localizedName);
        setCountryId(value.countryId);
        setSubdivisionIso(value.subdivisionIso);
        setLocalizedSubdivision(value.localizedSubdivision);
      } catch (error) {
        console.error("Failed to fetch account country:", error);
      }
    }

    // eslint-disable-next-line no-void
    void fetchAccountCountryCode();
  }, []);

  return {
    countryName,
    localizedName,
    countryId,
    subdivisionIso,
    localizedSubdivision,
  };
}
