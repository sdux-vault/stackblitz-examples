import {
  withTabSyncController,
  withTabSyncStateBehavior
} from '@sdux-vault/core';
import { FeatureCell, Vault } from '@sdux-vault/svelte';

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
export const exampleCell = FeatureCell<Example[]>(
  {
    key: 'example-feature-cell-key',
    initialState: []
  },
  [withTabSyncStateBehavior],
  [withTabSyncController]
);

/**
 * Configures the Vault runtime pipeline and finalizes initialization.
 *
 * After initialize() is called:
 * - The pipeline structure becomes immutable
 * - No additional behaviors or operators may be registered
 * - All subsequent state updates flow through the configured pipeline
 *
 * No state updates will be processed before initialize() is called.
 */
exampleCell.initialize();

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
