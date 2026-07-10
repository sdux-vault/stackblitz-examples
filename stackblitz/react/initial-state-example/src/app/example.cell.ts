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
 * scope with an `initialState` value. The `initialState` is the lowest-precedence
 * initialization source — `initialize()` processes it as a deterministic
 * `replaceState` through the full pipeline, seeding state before any consumer
 * reads it. Explicit `replaceState()` calls always override it.
 */
const exampleCell = FeatureCell<Example[]>({
  key: 'example-feature-cell-key',
  initialState: [{ id: 66, name: 'Darth', lastName: 'Vader' }]
});

// Initialize the pipeline
exampleCell.initialize();

/**
 * Read-only synchronous state snapshot exposed to React components.
 * Provides access to `value`, `isLoading`, `error`, and `hasValue`.
 */
export const exampleState = exampleCell.state;

/**
 * Observable stream of committed state snapshots.
 * Emits each time the FeatureCell pipeline commits a new value.
 */
export const exampleState$ = exampleCell.state$;

/**
 * Replaces the entire FeatureCell state with the provided input.
 *
 * @param input - The new collection of Example records to commit.
 * @returns void
 */
export function replaceExamples(input: Example[]): void {
  exampleCell.replaceState({
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
 * To return to a specific value, call `replaceExamples()` with the desired data.
 *
 * @returns void
 */
export function resetExamples(): void {
  exampleCell.reset();
}
