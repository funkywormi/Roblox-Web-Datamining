// Port of website's Roblox.Utilities ExponentialBackoff(Specification) for hosts without it.
import type {
  ExponentialBackoff as ExponentialBackoffInstance,
  ExponentialBackoffSpecification as ExponentialBackoffSpecificationInstance,
  ExponentialBackoffSpecificationOptions,
} from "./realtimeConfig";

const numberOr = (value: unknown, fallback: number) =>
  typeof value === "number" ? value : fallback;

export class ExponentialBackoffSpecification implements ExponentialBackoffSpecificationInstance {
  private readonly firstAttemptDelay: number;

  private readonly firstAttemptRandomnessFactor: number;

  private readonly subsequentDelayBase: number;

  private readonly subsequentDelayRandomnessFactor: number;

  private readonly maximumDelayBase: number;

  constructor(options: Partial<ExponentialBackoffSpecificationOptions> = {}) {
    this.firstAttemptDelay = numberOr(options.firstAttemptDelay, 5000);
    this.firstAttemptRandomnessFactor = numberOr(options.firstAttemptRandomnessFactor, 0.5);
    this.subsequentDelayBase = numberOr(options.subsequentDelayBase, this.firstAttemptDelay * 2);
    this.subsequentDelayRandomnessFactor = numberOr(
      options.subsequentDelayRandomnessFactor,
      this.firstAttemptRandomnessFactor,
    );
    this.maximumDelayBase = numberOr(options.maximumDelayBase, 5 * 60 * 1000);
  }

  FirstAttemptDelay = (): number => this.firstAttemptDelay;

  FirstAttemptRandomnessFactor = (): number => this.firstAttemptRandomnessFactor;

  SubsequentDelayBase = (): number => this.subsequentDelayBase;

  SubsequentDelayRandomnessFactor = (): number => this.subsequentDelayRandomnessFactor;

  MaximumDelayBase = (): number => this.maximumDelayBase;
}

const getRandomness = (base: number, randomnessFactor: number) =>
  Math.floor(Math.random() * (base * randomnessFactor));

export class ExponentialBackoff implements ExponentialBackoffInstance {
  private attemptCount = 0;

  private fastBackoffEnabled = false;

  private latestResetTime: number | null = null;

  constructor(
    private readonly regularSpec: ExponentialBackoffSpecificationInstance,
    private readonly fastBackoffPredicate?: (backoff: ExponentialBackoffInstance) => boolean,
    private readonly fastSpec?: ExponentialBackoffSpecificationInstance,
  ) {}

  StartNewAttempt = (): number => {
    if (this.attemptCount === 0 && this.fastBackoffPredicate?.(this)) {
      this.fastBackoffEnabled = true;
    }
    const delay = this.getDelay();
    this.attemptCount += 1;
    return delay;
  };

  Reset = (): void => {
    this.attemptCount = 0;
    this.latestResetTime = Date.now();
    this.fastBackoffEnabled = false;
  };

  GetAttemptCount = (): number => this.attemptCount;

  GetLastResetTime = (): number | null => this.latestResetTime;

  private getDelay() {
    const spec = this.fastBackoffEnabled && this.fastSpec ? this.fastSpec : this.regularSpec;
    if (this.attemptCount === 0) {
      const rawDelay = spec.FirstAttemptDelay();
      return rawDelay + getRandomness(rawDelay, spec.FirstAttemptRandomnessFactor());
    }
    const rawDelay = Math.min(
      spec.SubsequentDelayBase() * 2 ** (this.attemptCount - 1),
      spec.MaximumDelayBase(),
    );
    return rawDelay + getRandomness(rawDelay, spec.SubsequentDelayRandomnessFactor());
  }
}
