import {
  FeatureCell,
  Vault,
  withTabSyncController,
  withTabSyncStateBehavior
} from '@sdux-vault/core';

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
}

/**
 * Initializes the Vault runtime for the Tab Sync example.
 */
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
  devMode: true,

  /**
   * Disables license validation for demo environments.
   * Use only in StackBlitz or local playground setups.
   */
  bypassLicensing: true
});

/**
 * Registers the FeatureCell with cross-tab synchronization.
 *
 * withTabSyncStateBehavior broadcasts finalized state snapshots to other
 * browser tabs via BroadcastChannel. withTabSyncController coordinates
 * the initial negotiation when a new tab opens, ensuring it receives
 * the latest state from an existing peer.
 */
const exampleCell = FeatureCell<Example[]>(
  {
    key: 'example-feature-cell-key',
    initialState: []
  },
  [withTabSyncStateBehavior],
  [withTabSyncController]
);

let initialized = false;

/**
 * Configures the Vault runtime pipeline and finalizes initialization.
 *
 * Initialization is deferred to allow React components to subscribe
 * to state$ before the Tab Sync controller begins BroadcastChannel
 * negotiation. This ensures the subscription is active when the
 * negotiation snapshot is committed synchronously via commitState.
 *
 * Guarded to run only once — safe to call from React StrictMode
 * where useEffect fires twice.
 *
 * After initialize() is called:
 * - The pipeline structure becomes immutable
 * - No additional behaviors or operators may be registered
 * - All subsequent state updates flow through the configured pipeline
 *
 * No state updates will be processed before initialize() is called.
 */
export function initializeCell(): void {
  if (initialized) return;
  initialized = true;
  exampleCell.initialize();
}

/**
 * Read-only state snapshot accessor.
 *
 * Provides access to:
 * - value — current state value
 * - hasValue — whether state contains a value
 */
export const exampleState = exampleCell.state;

/**
 * Observable stream of state emissions.
 *
 * Each emission includes the full snapshot after pipeline execution.
 * Used by the component to subscribe to reactive state changes.
 */
export const exampleState$ = exampleCell.state$;

/**
 * Replaces the entire FeatureCell state with the provided input.
 *
 * When Tab Sync is enabled, the pipeline broadcasts the finalized
 * snapshot to all other tabs via BroadcastChannel.
 *
 * @param input - The new state value to commit.
 */
export function replaceExamples(input: Example[]): void {
  exampleCell.replaceState({
    loading: false,
    value: input,
    error: null
  });
}

/**
 * Resets the FeatureCell state to its initial value.
 */
export function resetExamples(): void {
  exampleCell.reset();
}
