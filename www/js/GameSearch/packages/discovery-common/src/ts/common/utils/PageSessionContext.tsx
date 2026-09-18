import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { parseQueryString } from "./parsingUtils";

type TPageSessionContext = {
  sessionId: string;
  rotateSessionId: () => string;
};

export const PageSessionContext = createContext<TPageSessionContext>({
  sessionId: "",
  rotateSessionId: () => "",
});

export const PageSessionProvider: React.FC = ({ children }) => {
  const paramString = window.location.href?.split("?")[1];
  const urlParams = paramString && parseQueryString(paramString);
  const referredSession =
    urlParams &&
    (urlParams.discoverPageSessionInfo ||
      urlParams.homePageSessionInfo ||
      urlParams.spotlightPageSessionInfo ||
      urlParams.preAuthLandingPageSessionInfo);
  const [session, setSession] = useState(
    referredSession && typeof referredSession === "string"
      ? referredSession
      : uuidService.generateRandomUuid(),
  );
  const rotateSessionId = useCallback(() => {
    const newId = uuidService.generateRandomUuid();
    setSession(newId);
    return newId;
  }, []);
  const value = useMemo(() => {
    return {
      sessionId: session,
      rotateSessionId,
    };
  }, [session, rotateSessionId]);
  return <PageSessionContext.Provider value={value}>{children}</PageSessionContext.Provider>;
};

type WithPageSession = <P>(WrappedComponent: React.FC<P>) => React.FC<P>;

export const withPageSession: WithPageSession = <P,>(Component: React.FC<P>) => {
  const WrappedComponent = (props: React.PropsWithChildren<P>) => {
    return (
      <PageSessionProvider>
        <Component {...props} />
      </PageSessionProvider>
    );
  };

  return WrappedComponent;
};

export const usePageSession = (): string => {
  return useContext(PageSessionContext).sessionId;
};

export const useRotatePageSession = (): (() => string) => {
  return useContext(PageSessionContext).rotateSessionId;
};
