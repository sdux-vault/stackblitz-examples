import { FeatureCell, Vault } from '@sdux-vault/core';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';

/**
 * Defines the domain state managed by the counter FeatureCell.
 * Every field is replaced atomically on each pipeline commit so readers
 * always see a fully consistent snapshot — never a partially updated object.
 */
interface CounterState {
  /** Current counter value, incremented by each pipeline write. */
  count: number;

  /** Descriptive label carried forward unchanged through increments. */
  label: string;

  /** ISO timestamp of the last committed state update. */
  lastUpdate: string;
}

/**
 * Narrows the shape of each emission from `state$` to the fields this
 * script reads. The `snapshot.value` property holds the fully committed
 * domain value after the pipeline finishes processing.
 */
interface CounterStateEmit {
  snapshot: {
    value: CounterState | undefined;
  };
}

/**
 * Initializes the Vault runtime before any FeatureCell is created.
 * `logLevel: 'off'` suppresses internal pipeline logs so the script output
 * contains only the console statements written below.
 */
Vault({ logLevel: 'off', devMode: false });

// ─── Example Runner ───────────────────────────────────────────────────────────

/**
 * Orchestrates the replace example script. The FeatureCell and all helper
 * methods live on the class so every `await` has a proper `async` context and
 * state is fully encapsulated within the single instance.
 */
class ReplaceExample {
  /**
   * The counter FeatureCell with a zeroed initial state. No Vault configuration
   * or framework bootstrap is needed — SDuX Vault runs as a plain TypeScript
   * module in Node with no extra wiring.
   */
  #cell = FeatureCell<CounterState>({
    key: 'counter',
    initialState: {
      count: 0,
      label: 'Counter Example',
      lastUpdate: new Date().toISOString()
    }
  });

  /**
   * Creates the runner and starts the FeatureCell pipeline. `initialize()` is
   * called here so the cell is ready before `run()` issues any state mutations.
   */
  constructor() {
    this.#cell.initialize();
  }

  /**
   * Runs the full example sequence: reads initial state, increments three times,
   * replaces with a custom value, then resets to zero. Each step awaits a
   * confirmed committed snapshot before logging.
   */
  async run(): Promise<void> {
    console.log('=== SDuX Vault Node.js Replace Example ===\n');

    // initialize() queues the initialState commit in the microtask queue.
    // A zero-timeout tick yields to the event loop so the microtask queue
    // flushes and the committed initialState is available before we read it.
    await new Promise((resolve) => setTimeout(resolve, 0));

    console.log('[CELL] Counter cell created');
    console.log(
      `[STATE] Initial: count=${this.#cell.state.value?.count}, label="${this.#cell.state.value?.label}"\n`
    );

    // Increment three times — each call awaits a confirmed committed snapshot
    for (let i = 0; i < 3; i++) {
      console.log('[ACTION] Incrementing counter...');
      const state = await this.#incrementCounter();
      console.log(`[STATE]  count=${state.count}, label="${state.label}"\n`);
    }

    // Replace with an entirely different state in one atomic write
    console.log(
      '[ACTION] Replacing with custom state: count=42, label="My Custom Count"'
    );
    const replaced = await this.#replaceCounter(42, 'My Custom Count');
    console.log(
      `[STATE]  count=${replaced.count}, label="${replaced.label}"\n`
    );

    // Increment once more — shows the counter continuing from the replaced state
    console.log('[ACTION] Incrementing counter...');
    const afterReplace = await this.#incrementCounter();
    console.log(
      `[STATE]  count=${afterReplace.count}, label="${afterReplace.label}"\n`
    );

    // Reset to zero — the label also changes to reflect the reset intent
    console.log('[ACTION] Resetting counter to zero...');
    const reset = await this.#replaceCounter(0, 'Counter Reset');
    console.log(`[STATE]  count=${reset.count}, label="${reset.label}"\n`);

    console.log('=== Done ===');
  }

  /**
   * Registers a listener on `state$` that resolves with the next committed
   * snapshot. `skip(1)` discards the BehaviorSubject's current value on
   * subscription so the promise resolves only when a new pipeline write arrives.
   *
   * Register this listener _before_ issuing any state mutation so the promise
   * is guaranteed to correspond to that specific write.
   *
   * @returns A promise resolving with the next committed `CounterState`.
   */
  async #waitForNextState(): Promise<CounterState> {
    const emit = await firstValueFrom<CounterStateEmit>(
      this.#cell.state$.pipe(skip(1))
    );
    return emit.snapshot.value as CounterState;
  }

  /**
   * Replaces the entire counter state atomically and returns the committed
   * result. The next-emission listener is registered before `replaceState` is
   * called so the promise resolves with exactly the snapshot produced by this
   * write — not a stale value from a previous commit.
   *
   * @param count - The new counter value.
   * @param label - The new counter label.
   * @returns A promise resolving with the committed `CounterState`.
   */
  async #replaceCounter(count: number, label: string): Promise<CounterState> {
    const nextEmission = this.#waitForNextState();
    this.#cell.replaceState({
      loading: false,
      error: null,
      value: { count, label, lastUpdate: new Date().toISOString() }
    });
    return nextEmission;
  }

  /**
   * Increments the counter by one and commits the change through the pipeline.
   * The current label is read from the live cell state so only `count` and
   * `lastUpdate` change — the label carries forward unchanged.
   *
   * @returns A promise resolving with the committed `CounterState`.
   */
  async #incrementCounter(): Promise<CounterState> {
    const current = this.#cell.state.value ?? {
      count: 0,
      label: 'Counter Example',
      lastUpdate: ''
    };
    return this.#replaceCounter(current.count + 1, current.label);
  }
}

new ReplaceExample().run().then(() => process.exit(0));
