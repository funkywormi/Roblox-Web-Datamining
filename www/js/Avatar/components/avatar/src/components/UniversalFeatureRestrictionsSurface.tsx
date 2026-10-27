import type { UniversalFeatureRestrictionsSurfaceProps } from "@rbx/universal-feature-restrictions";
import { UniversalFeatureRestrictionDialog } from "@rbx/universal-feature-restrictions/dialog";
import useUniversalFeatureRestrictionsConfig from "../hooks/useUniversalFeatureRestrictionsConfig";

const UniversalFeatureRestrictionsSurface = (props: UniversalFeatureRestrictionsSurfaceProps) => {
  const config = useUniversalFeatureRestrictionsConfig();
  return <UniversalFeatureRestrictionDialog config={config} {...props} />;
};

export default UniversalFeatureRestrictionsSurface;
