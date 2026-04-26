import { withDelayController } from '@sdux-vault/addons';
import { FeatureCell, Vault } from '@sdux-vault/core';

/**
 * Shape representing a single example entity in the FeatureCell state.
 */
export interface Example {
  /** Unique identifier for the example entry. */
  id: number;

  /** First name of the character. */
  name: string;

  /** Last name of the character. */
  lastName: string;

  /** Whether the character is a Jedi, set by the jediReducer. */
  jedi?: boolean;

  /** Whether the character is a Senator, set by the jediReducer. */
  senator?: boolean;
}

// Initialize the Vault once at application startup
Vault({ logLevel: 'off' });

// Register the FeatureCell at module scope
const exampleCell = FeatureCell<Example[]>(
  // FeatureCell descriptor (identity + initial state)
  {
    // Unique state key used by the Vault
    key: 'example-feature-cell-key',

    // Fallback Initial value for the state
    initialState: []
  },

  // Optional definition-time extensions
  [
    // --> Register add-on behaviors here <--
  ],
  [
    // Register the withDelayController add-on controller to enable delay behavior in this FeatureCell
    withDelayController
    // --> Register add-on controllers here <--
  ]
);

/**
 * Configures the Vault runtime pipeline with a delay interceptor,
 * and finalizes the FeatureCell initialization.
 *
 * Pipeline execution order:
 *
 * 1. `.withDelay({ millisecondDelay: 3_000 })` — Holds all state
 *    updates for 3 seconds before releasing them into the pipeline.
 *    The UI will not reflect new data until the delay expires.
 *
 * 2. `.initialize()` — Locks the pipeline. No further behaviors can
 *    be registered after this call. State updates are only processed
 *    after initialization completes.
 */
exampleCell.withDelay?.({ millisecondDelay: 3_000 }).initialize();

// Expose read-only state access
export const exampleState = exampleCell.state;
export const exampleState$ = exampleCell.state$;

/** Replaces the entire FeatureCell state with the provided input. */
export function replaceExamples(input: Example[]): void {
  exampleCell.replaceState({
    loading: false,
    value: input,
    error: null
  });
}

/** Resets the FeatureCell state to its initial value. */
export function resetExamples(): void {
  exampleCell.reset();
}

/** Toggles the loading flag on the current state. */
export function toggleLoading(loading: boolean): void {
  exampleCell.replaceState({
    loading,
    value: exampleState.value
  });
}

/** Toggles the error state between an Error instance and null. */
export function toggleError(error: Error | null): void {
  exampleCell.replaceState({
    error,
    value: exampleState.value
  });
}
