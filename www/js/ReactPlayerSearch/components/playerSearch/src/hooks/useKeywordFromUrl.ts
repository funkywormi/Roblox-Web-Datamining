import { useCallback, useEffect, useState } from "react";

const getKeywordFromLocation = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("keyword")?.trim() ?? "";
};

export const useKeywordFromUrl = () => {
  const [keyword, setKeyword] = useState(getKeywordFromLocation);

  useEffect(() => {
    const onPopState = () => {
      setKeyword(getKeywordFromLocation());
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const updateKeyword = useCallback((nextKeyword: string) => {
    const url = new URL(window.location.href);
    const normalizedKeyword = nextKeyword.trim();

    if (normalizedKeyword) {
      url.searchParams.set("keyword", normalizedKeyword);
    } else {
      url.searchParams.delete("keyword");
    }

    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setKeyword(normalizedKeyword);
  }, []);

  return {
    keyword,
    setKeyword: updateKeyword,
  };
};
