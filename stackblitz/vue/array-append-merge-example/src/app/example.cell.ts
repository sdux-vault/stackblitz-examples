import { withArrayAppendMergeBehavior } from '@sdux-vault/addons';
import { FeatureCell, Vault } from '@sdux-vault/core';

/**
 * Shape representing a single example entity in the FeatureCell state.
 * Used as the typed element of the `Example[]` collection managed by the cell.
 */
export interface Example {
  /** Unique identifier for the example entry. */
  id: number;

  /** First name of the character. */
  name: string;

  /** Last name of the character. */
  lastName: string;
}

// Initialize the Vault once at application startup
Vault({
  /**
   * Controls the verbosity of internal logging.
   * Levels: `'debug' | 'info' | 'warn' | 'error' | 'off'`.
   * Set to `'debug'` during development to trace pipeline activity.
   */
  logLevel: 'off',

  /**
   * Enables development-mode diagnostics.
   * When `true`, the SDuX Debugger panel and Chrome Extension
   * receive real-time pipeline trace events.
   */
  devMode: false
});

/**
 * FeatureCell for the 'example-feature-cell-key' state, registered at module
 * scope with an `initialState` value and the `withArrayAppendMergeBehavior`.
 * The `initialState` seeds state on `initialize()`, and every subsequent
 * `mergeState()` call concatenates the incoming array with the existing state,
 * growing the list without discarding previous entries.
 */
const exampleCell = FeatureCell<Example[]>(
  // FeatureCell descriptor (identity + initial state)
  {
    // Unique state key used by the Vault
    key: 'example-feature-cell-key',

    // Fallback Initial value for the state
    initialState: [{ id: 66, name: 'Darth', lastName: 'Vader' }]
  },

  // Optional definition-time extensions
  [
    // Register the withArrayAppendMergeBehavior to enable array append merge semantics
    withArrayAppendMergeBehavior
    // --> Register add-on behaviors here <--
  ],
  [
    // --> Register add-on controllers here <--
  ]
);

// Initialize the pipeline
exampleCell.initialize();

/**
 * Read-only synchronous state snapshot exposed to Vue components.
 * Provides access to `value`, `isLoading`, `error`, and `hasValue`.
 */
export const exampleState = exampleCell.state;

/**
 * Observable stream of committed state snapshots.
 * Emits each time the FeatureCell pipeline commits a new value.
 */
export const exampleState$ = exampleCell.state$;

/**
 * Appends `input` to the existing FeatureCell state array using the
 * configured `withArrayAppendMergeBehavior`.
 *
 * The incoming array passes through the merge stage of the pipeline,
 * where the behavior concatenates it with the current state, producing
 * a new combined array as the final state value.
 *
 * @param input - The array of Example records to append to the current state.
 * @returns void
 */
export function mergeExamples(input: Example[]): void {
  exampleCell.mergeState({
    loading: false,
    value: input,
    error: null
  });
}

/**
 * Clears the FeatureCell state to `undefined`, resetting the loading and
 * error fields without destroying the FeatureCell or its pipeline.
 *
 * This does NOT restore the `initialState` configured at registration.
 * To return to a specific value, call `mergeExamples()` with the desired data.
 *
 * @returns void
 */
export function resetExamples(): void {
  exampleCell.reset();
}
