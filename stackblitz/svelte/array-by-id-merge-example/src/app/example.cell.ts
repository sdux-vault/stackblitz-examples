import { withArrayByIdMergeBehavior } from '@sdux-vault/addons';
import { FeatureCell, Vault } from '@sdux-vault/svelte';

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
 * scope with an `initialState` value and the `withArrayByIdMergeBehavior`.
 * The `initialState` seeds state on `initialize()`. The behavior compares each
 * incoming record by its `id`, updating matching records and adding new ones.
 */
export const exampleCell = FeatureCell<Example[]>(
  // FeatureCell descriptor (identity + initial state)
  {
    // Unique state key used by the Vault
    key: 'example-feature-cell-key',

    // Fallback Initial value for the state
    initialState: [{ id: 66, name: 'Anakin', lastName: 'Skywalker' }]
  },

  // Optional definition-time extensions
  [
    // Register the withArrayByIdMergeBehavior to merge records by their `id` value.
    withArrayByIdMergeBehavior
    // --> Register add-on behaviors here <--
  ],
  [
    // --> Register add-on controllers here <--
  ]
);

/**
 * Configure the property used to match records before initializing the
 * pipeline. The by-ID merge behavior uses this `id` key for updates, additions,
 * and deletions.
 */
exampleCell.withArrayMergeId?.({ idKey: 'id' });

// Initialize the pipeline
exampleCell.initialize();

/**
 * Merges `input` into the existing FeatureCell state array using the
 * configured `withArrayByIdMergeBehavior`.
 *
 * Records with matching IDs update the existing records. Records with new IDs
 * are added to the array.
 *
 * @param input - The array of Example records to merge into the current state.
 * @returns void
 */
export function mergeExamples(input: Example[]): void {
  exampleCell.mergeState({ value: input });
}

/**
 * Removes records from the FeatureCell state whose IDs match `input`.
 *
 * The `isDelete` option tells `withArrayByIdMergeBehavior` to remove matching
 * records instead of merging their values into the current array.
 *
 * @param input - The records whose IDs should be removed from the state.
 * @returns void
 */
export function deleteExamples(input: Example[]): void {
  exampleCell.mergeState({ value: input }, { isDelete: true });
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
