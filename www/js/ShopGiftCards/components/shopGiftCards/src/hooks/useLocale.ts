import { useCallback, useEffect, useState } from "react";
import { getLocale } from "../services/localeService";

export default function useLocale(): string {
  const [locale, setLocale] = useState<string>("");

  const fetchLocale = useCallback(async () => {
    const {
      data: { ugc },
    } = await getLocale();
    setLocale(ugc.locale.replace("_", "-"));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchLocale();
  }, [fetchLocale]);

  return locale;
}
