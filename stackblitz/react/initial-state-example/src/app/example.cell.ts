import { FeatureCell, Vault } from '@sdux-vault/react';

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
export const exampleCell = FeatureCell<Example[]>({
  key: 'example-feature-cell-key',
  initialState: [{ id: 66, name: 'Darth', lastName: 'Vader' }]
});

// Initialize the pipeline
exampleCell.initialize();
