import { useCountdown } from "../hooks/useCountdown";

type TChatTimeoutTimerProps = {
  /** Epoch ms the timeout ends. */
  expiresAtMs: number;
  /** Called once when the countdown reaches zero (e.g. to re-enable the input). */
  onExpiry?: () => void;
  className?: string;
};

/** Renders a live `h:mm:ss` / `m:ss` countdown to `expiresAtMs`. */
const ChatTimeoutTimer = ({ expiresAtMs, onExpiry, className }: TChatTimeoutTimerProps) => {
  const label = useCountdown(expiresAtMs, onExpiry);
  return <span className={className}>{label}</span>;
};

export default ChatTimeoutTimer;
