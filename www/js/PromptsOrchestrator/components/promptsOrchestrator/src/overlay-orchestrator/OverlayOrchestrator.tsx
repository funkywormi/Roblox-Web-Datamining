import { selectActiveOverlay } from "./store/overlay-queue/overlayQueueSelectors";
import { useOverlayOrchestratorStore } from "./store/overlayOrchestratorStore";
import { OverlayRenderer, type OverlayPrompt } from "./types";
import { FaeUpsellAdapter } from "./adapter/faeUpsellAdapter";
import { CustomRenderDialogAdapter } from "./adapter/customRenderDialogAdapter";
import { SduiOverlayAdapter } from "./adapter/sduiOverlayAdapter";
import { useOverlayScheduler } from "./scheduler/useOverlayScheduler";
import { isSduiOverlayPrompt } from "./scheduler/utils";

type OverlayAdapterProps = { prompt: OverlayPrompt };

const OverlayAdapter = ({ prompt }: OverlayAdapterProps) => {
  if (isSduiOverlayPrompt(prompt)) {
    return <SduiOverlayAdapter prompt={prompt} />;
  }

  switch (prompt.renderer) {
    case OverlayRenderer.CustomRenderDialog:
      return <CustomRenderDialogAdapter prompt={prompt} />;
    case OverlayRenderer.FaeUpsell:
      return <FaeUpsellAdapter prompt={prompt} />;
    default:
      return null;
  }
};

export const OverlayOrchestrator = () => {
  useOverlayScheduler();
  const activeOverlay = useOverlayOrchestratorStore(selectActiveOverlay);

  if (!activeOverlay) {
    return null;
  }

  const { prompt } = activeOverlay;
  return <OverlayAdapter key={`${prompt.renderer}:${prompt.id}`} prompt={prompt} />;
};
