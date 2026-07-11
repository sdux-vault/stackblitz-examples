import { FeatureCell, Vault } from '@sdux-vault/core';

/**
 * Defines one character record stored in the example's array state.
 * The hydration factory and later replacement use the same shape.
 */
export interface Example {
  /** Identifies the character within the FeatureCell array. */
  id: number;

  /** Stores the character's first name for display. */
  name: string;

  /** Stores the character's last name for display. */
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
 * Owns the FeatureCell that demonstrates deferred initialization with `hydrate()`.
 * The descriptor leaves its fallback undefined so the factory registered before
 * `initialize()` supplies the authoritative initial value. Svelte components read
 * the exposed snapshot and stream while mutation functions in this module keep
 * pipeline access in one place.
 */
const exampleCell = FeatureCell<Example[] | undefined>({
  key: 'example-feature-cell-key',
  initialState: undefined
});

// Register the deferred factory before initializing the pipeline
exampleCell
  .hydrate(() =>
    Promise.resolve([{ id: 1, name: 'Darth', lastName: 'Sidious' }])
  )
  .initialize();

/**
 * Exposes the current read-only state used to seed the component's `$state` snapshot.
 * Its `value` and `hasValue` fields reflect hydration and later pipeline updates.
 */
export const exampleState = exampleCell.state;

/**
 * Emits committed snapshots so the Svelte component can keep its rune state reactive.
 * Hydration and later replacements flow through the same subscription surface.
 */
export const exampleState$ = exampleCell.state$;

/**
 * Replaces the entire hydrated state with a caller-provided character array.
 * The replacement travels through the same active pipeline and updates subscribers.
 * @param input - Character records that become the next FeatureCell value.
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
 * Clears the FeatureCell snapshot without rerunning its hydration factory.
 * The initialized pipeline remains active for later replacements.
 * @returns void
 */
export function resetExamples(): void {
  exampleCell.reset();
}
