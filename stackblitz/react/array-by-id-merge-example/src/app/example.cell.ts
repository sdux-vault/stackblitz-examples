import { withArrayByIdMergeBehavior } from '@sdux-vault/addons';
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
 * FeatureCell for the `example-feature-cell-key` state, registered at module
 * scope with an `initialState` value and the `withArrayByIdMergeBehavior`.
 * The `withArrayMergeId({ idKey: 'id' })` configuration identifies records by
 * their `id`, allowing merges to update matching records and add new records.
 */
export const exampleCell = FeatureCell<Example[]>(
  // FeatureCell descriptor (identity + initial state)
  {
    // Unique state key used by the Vault
    key: 'example-feature-cell-key',

    // Fallback Initial value for the state
    initialState: [{ id: 66, name: 'Darth', lastName: 'Vader' }]
  },

  // Optional definition-time extensions
  [
    // Register the withArrayByIdMergeBehavior to enable ID-based merge semantics
    withArrayByIdMergeBehavior
    // --> Register add-on behaviors here <--
  ],
  [
    // --> Register add-on controllers here <--
  ]
);

// Configure the entity identifier before activating the pipeline.
exampleCell.withArrayMergeId?.({ idKey: 'id' });
exampleCell.initialize();

/**
 * Merges entity records into the current array by their `id` property.
 *
 * Existing IDs are updated with the incoming record, while new IDs are added
 * to the state. The React component reads the resulting snapshot through the
 * `useSyncExternalStore()` bridge.
 *
 * @param input - Entity records to update or add to the current state.
 * @returns void
 */
export function mergeExamples(input: Example[]): void {
  exampleCell.mergeState({
    value: input
  });
}

/**
 * Removes entity records whose IDs match the supplied records.
 *
 * The array-by-ID behavior uses the `isDelete` option to remove matching
 * records while preserving all other entries in the FeatureCell state.
 *
 * @param input - Entity records whose IDs should be removed from the state.
 * @returns void
 */
export function deleteExamples(input: Example[]): void {
  exampleCell.mergeState(
    {
      value: input
    },
    {
      isDelete: true
    }
  );
}

/**
 * Clears the current FeatureCell value without destroying its pipeline.
 *
 * Resetting removes the active value rather than restoring the registered
 * initial state. Call `mergeExamples()` with entity records to build the array again.
 *
 * @returns void
 */
export function resetExamples(): void {
  exampleCell.reset();
}
