import { useRef } from 'react';

let globalId = 0;

// Use CSS-safe unicode guillemets («») as the default prefix, matching the format
// adopted by React 19.2's useId (facebook/react#32001). The previous prefix ":"
// produced IDs like ":r1" which are invalid in CSS selectors, view-transition-name,
// anchor-name, and querySelector(), causing SyntaxError in DOM environments like jsdom.
// See: https://github.com/facebook/react/issues/26839
const useId = (prefix = '«r') => {
  const idRef = useRef<string>();
  if (!idRef.current) {
    globalId += 1;
    idRef.current = `${prefix}${globalId}`;
  }
  return idRef.current;
};

export default useId;
