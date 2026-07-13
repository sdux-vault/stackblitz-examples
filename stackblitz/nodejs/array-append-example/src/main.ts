import { withArrayAppendMergeBehavior } from '@sdux-vault/addons';
import { FeatureCell, Vault } from '@sdux-vault/core';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';

/**
 * Shape representing a single example entity in the FeatureCell state.
 * Used as the typed element of the `Example[]` collection managed by the cell.
 */
interface Example {
  /** Unique identifier for the example entry. */
  id: number;

  /** First name of the character. */
  name: string;

  /** Last name of the character. */
  lastName: string;
}

/**
 * Narrows the shape of each emission from `state$` to the fields this
 * script reads. The `snapshot.value` property holds the fully committed
 * domain value after the pipeline finishes processing.
 */
interface ExamplesStateEmit {
  snapshot: {
    value: Example[] | undefined;
  };
}

/**
 * Initializes the Vault runtime before any FeatureCell is created. This is
 * required when using add-on behaviors from `@sdux-vault/addons` — the Vault
 * must be present before behaviors are registered at cell creation time.
 * `logLevel: 'off'` suppresses internal pipeline logs so the script output
 * contains only the console statements written below.
 */
Vault({ logLevel: 'off', devMode: false });

// ─── Example Runner ───────────────────────────────────────────────────────────

/**
 * Orchestrates the array append example script. The FeatureCell and all helper
 * methods live on the class so every `await` has a proper `async` context and
 * state is fully encapsulated within the single instance.
 */
class ArrayAppendExample {
  /**
   * The examples FeatureCell with a seed entry in `initialState` and
   * `withArrayAppendMergeBehavior` registered as a definition-time behavior.
   * After `initialize()`, every `mergeState()` call concatenates the incoming
   * array with the existing state rather than replacing it — previous entries
   * are never discarded, only extended.
   */
  #cell = FeatureCell<Example[]>(
    // FeatureCell descriptor (identity + initial state)
    {
      key: 'examples',
      initialState: [{ id: 66, name: 'Darth', lastName: 'Vader' }]
    },

    // Definition-time behaviors — configure the merge stage of the pipeline
    [
      // Concatenates the incoming array with the existing state on every mergeState() call
      withArrayAppendMergeBehavior
    ],

    // Controllers — none used in this example
    []
  );

  /**
   * Creates the runner and starts the FeatureCell pipeline. `initialize()` is
   * called here so the cell is ready before `run()` issues any state mutations.
   */
  constructor() {
    this.#cell.initialize();
  }

  /**
   * Runs the full example sequence: seeds initial state, merges two batches,
   * then resets. Each step awaits a confirmed committed snapshot before
   * logging so the output always reflects the actual pipeline result.
   */
  async run(): Promise<void> {
    console.log('=== SDuX Vault Node.js Array Append Example ===\n');

    // initialize() queues the initialState commit in the microtask queue.
    // A zero-timeout tick yields to the event loop so the microtask queue
    // flushes and the committed initialState is available before we read it.
    await new Promise((resolve) => setTimeout(resolve, 0));

    console.log(
      '[CELL] Examples cell created with initialState + withArrayAppendMergeBehavior'
    );
    console.log(
      `[STATE] Initial: [${this.#cell.state.value?.map((e) => this.#label(e)).join(', ')}]\n`
    );

    // Merge one entry — withArrayAppendMergeBehavior concatenates, not replaces
    console.log('[ACTION] Merging [Luke Skywalker]...');
    const after1 = await this.#mergeExamples([
      { id: 1, name: 'Luke', lastName: 'Skywalker' }
    ]);
    console.log(`[STATE]  [${after1.map((e) => this.#label(e)).join(', ')}]\n`);

    // Merge two more entries — all previous entries are preserved in the committed snapshot
    console.log('[ACTION] Merging [Han Solo, Leia Organa]...');
    const after2 = await this.#mergeExamples([
      { id: 2, name: 'Han', lastName: 'Solo' },
      { id: 3, name: 'Leia', lastName: 'Organa' }
    ]);
    console.log(`[STATE]  [${after2.map((e) => this.#label(e)).join(', ')}]\n`);

    // Reset clears state to undefined without destroying the cell or its pipeline
    console.log('[ACTION] Resetting state...');
    this.#cell.reset();
    console.log(
      `[STATE]  ${this.#cell.state.value ?? 'undefined'} (state cleared, cell pipeline intact)\n`
    );

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
   * @returns A promise resolving with the next committed `Example[]`.
   */
  async #waitForNextState(): Promise<Example[]> {
    const emit = await firstValueFrom<ExamplesStateEmit>(
      this.#cell.state$.pipe(skip(1))
    );
    return emit.snapshot.value as Example[];
  }

  /**
   * Appends `input` to the existing state array through the pipeline and
   * returns the committed result. The `withArrayAppendMergeBehavior` registered
   * at cell creation concatenates `input` with the current state — the incoming
   * array does not replace the existing entries, it extends them.
   *
   * @param input - The array of Example records to append.
   * @returns A promise resolving with the committed `Example[]` after the merge.
   */
  async #mergeExamples(input: Example[]): Promise<Example[]> {
    const nextEmission = this.#waitForNextState();
    this.#cell.mergeState({ loading: false, value: input, error: null });
    return nextEmission;
  }

  /**
   * Returns a compact display label for a single example entry.
   *
   * @param e - The example to label.
   * @returns A formatted "First Last" string.
   */
  #label(e: Example): string {
    return `${e.name} ${e.lastName}`;
  }
}

// The example logic uses only runtime-neutral APIs, so this same file runs in
// Node, Bun, Deno, or the browser. `process` only exists in Node-like runtimes,
// so guard the call: in Node it forces a clean exit (an open RxJS subscription
// can otherwise keep the event loop alive and hang the script); everywhere else
// this is a harmless no-op.
new ArrayAppendExample().run().then(() => {
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(0);
  }
});
